import mongoose from "mongoose";
import { MediaAsset } from "../../../models/MediaAsset.model.js";
import { MediaFile } from "../../../models/MediaFile.models.js";
import { InternalServerError, NotFoundError, UnauthorizedError, ConflictError, BadRequestError } from "../../../errors/index.js";
import { generateUniqueSlug, normalizeNamespace, } from "../../../utils/media.utils.js";
import { deleteFromStorage } from "../../../utils/storage.utils.js";


const runInTransaction = async (fn) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const result = await fn(session);
    await session.commitTransaction();
    return result;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

export const createAsset = async ({
  title,
  slug,
  usageType,
  namespace,
  file,
  uploadedBy
}, session = null) => {

  const execute = async (session) => {
    const mediaFile = await MediaFile.findById(file).session(session);

    if (!mediaFile) {
      throw new NotFoundError("Media file not found");
    }

    if (mediaFile.uploadedBy.toString() !== uploadedBy.toString()) {
      throw new UnauthorizedError("Media file must be from same user");
    }

    const finalSlug = generateUniqueSlug(slug, title);

    console.log(uploadedBy)

    const [mediaAsset] = await MediaAsset.create([{
      title,
      slug: finalSlug,
      uploadedBy,
      namespace: normalizeNamespace(namespace),
      file,
      usageType
    }], { session });

    await MediaFile.updateOne(
      { _id: file },
      { $inc: { refCount: 1 } },
      { session }
    );

    return mediaAsset;
  };

  return session ? execute(session) : runInTransaction(execute);
};



// ------------------------
// GET ALL MediaAssets
// ------------------------
export const getAllAssets = async (filters = {}) => {

  const query = {};

  if (filters.usageType) query.usageType = filters.usageType;
  if (filters.uploadedBy) query.uploadedBy = filters.uploadedBy;

  const page = parseInt(filters.page || "1");
  const limit = parseInt(filters.limit || "20");
  const skip = (page - 1) * limit;

  const assets = await MediaAsset.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("file", "url mimeType size"); // populate linked MediaFile if exists

  return assets;
}

// ------------------------
// GET ONE MediaAsset
// ------------------------
export const getAssetById = async (mediaAssetId) => {

  const asset = await MediaAsset.findById(mediaAssetId).populate("file", "url mimeType size");

  if (!asset) throw new NotFoundError("Media asset not found");

  return asset;
}

export const updateAsset = async (mediaAssetId, updates, updatedBy, session = null) => {

  const execute = async (session) => {
    const asset = await MediaAsset.findById(mediaAssetId).session(session);

    if (!asset) throw new NotFoundError("Media asset not found");

    if (!asset.uploadedBy || asset.uploadedBy.toString() !== updatedBy?.toString()) {
      throw new UnauthorizedError("Not allowed to update this asset");
    }

    const { title, slug, usageType, namespace } = updates;

    if (title) asset.title = title;
    if (slug) asset.slug = slug;
    if (usageType) asset.usageType = usageType;
    if (namespace) asset.namespace = normalizeNamespace(namespace);

    try {
      await asset.save({ session });
    } catch (err) {
      if (err.code === 11000) {
        throw new ConflictError("Slug already exists");
      }
      throw err;
    }

    return asset;
  };

  return session ? execute(session) : runInTransaction(execute);
};

export const deleteAsset = async (id, userId, session = null) => {

  const execute = async (session) => {
    const asset = await MediaAsset.findById(id).session(session);

    if (!asset) throw new NotFoundError("Media asset not found");

    if (!userId || asset.uploadedBy.toString() !== userId.toString()) {
      throw new UnauthorizedError("Not allowed to delete this asset");
    }

    const fileId = asset.file;

    await MediaAsset.deleteOne({ _id: id }).session(session);

    await MediaFile.updateOne(
      { _id: fileId },
      { $inc: { refCount: -1 } },
      { session }
    );

    const deletedFile = await MediaFile.findOneAndDelete(
      {
        _id: fileId,
        refCount: { $lte: 0 }
      },
      { session }
    );

    if (deletedFile) {
      await deleteFromStorage(deletedFile.storageKey);
    }

    return { success: true };
  };

  return session ? execute(session) : runInTransaction(execute);
};

export const bulkDeleteAssets = async (ids, userId, session = null) => {

  const execute = async (session) => {

    const assets = await MediaAsset.find({
      _id: { $in: ids },
      uploadedBy: userId
    }).session(session);

    if (assets.length !== ids.length) {
      throw new UnauthorizedError("Not allowed to delete some assets");
    }

    await MediaAsset.deleteMany({
      _id: { $in: ids }
    }).session(session);

    const fileUsageMap = {};

    for (const asset of assets) {
      const id = asset.file.toString();
      fileUsageMap[id] = (fileUsageMap[id] || 0) + 1;
    }

    await Promise.all(
      Object.entries(fileUsageMap).map(([fileId, count]) =>
        MediaFile.updateOne(
          { _id: fileId },
          { $inc: { refCount: -count } },
          { session }
        )
      )
    );

    const fileIds = [...new Set(assets.map(a => a.file.toString()))];

    const filesToDelete = await MediaFile.find({
      _id: { $in: fileIds },
      refCount: { $lte: 0 }
    }).session(session);

    await MediaFile.deleteMany({
      _id: { $in: filesToDelete.map(f => f._id) }
    }).session(session);

    if (filesToDelete.length) {
      await Promise.allSettled(
        filesToDelete.map(f => deleteFromStorage(f.storageKey))
      );
    }

    return { success: true };
  };

  return session ? execute(session) : runInTransaction(execute);
};