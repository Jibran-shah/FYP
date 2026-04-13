import mongoose from "mongoose";
import { MediaFile } from "../../../models/MediaFile.models.js";
import { uploadToStorage, deleteFromStorage, generateFileName, getFileFormat } from "../../../utils/storage.utils.js"; 
import { InternalServerError, BadRequestError, ConflictError, NotFoundError, UnauthorizedError } from "../../../errors/Http.error.js";
import crypto from "crypto"


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
export const createMediaFile = async ({ file, uploadedBy }, session = null) => {
  if (!file) throw new BadRequestError("No file provided");

  const _id = new mongoose.Types.ObjectId();
  const fileName = generateFileName({ originalName: file.originalname });
  const hash = crypto.createHash("sha256").update(file.buffer).digest("hex");

  let uploaded;

  const execute = async (session) => {
    try {
      uploaded = await uploadToStorage(
        file.buffer,
        fileName,
        file.mimetype,
        uploadedBy
      );

      const mediaFile = await MediaFile.create(
        [{
          _id,
          provider: { name: "local" },
          storageKey: uploaded.storageKey,
          url: uploaded.url,
          fileName,
          mimeType: file.mimetype,
          format: getFileFormat(file.mimetype),
          size: file.size,
          hash,
          uploadedBy,
          refCount: 0
        }],
        { session }
      );

      return toMediaDTO(mediaFile[0]);

    } catch (err) {
      if (uploaded?.storageKey) {
        await deleteFromStorage(uploaded.storageKey);
      }
      throw err;
    }
  };

  return session ? execute(session) : runInTransaction(execute);
};


export const getAllMediaFiles = async (filters = {}) => {
  const query = {};

  if (filters.uploadedBy) {
    query.uploadedBy = filters.uploadedBy;
  }

  const page = parseInt(filters.page || "1");
  const limit = parseInt(filters.limit || "20");
  const skip = (page - 1) * limit;


  const [docs, total] = await Promise.all([
    MediaFile.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    MediaFile.countDocuments(query)
  ]);


  const data = docs.map(toMediaDTO);

  const pages = Math.ceil(total / limit);
  

  const pagination = {
    total,
    page,
    limit,
    pages,
    hasNextPage: page < pages,
    hasPrevPage: page > 1
  };

  
  return {
    data,
    pagination
  };
};



export const getMediaFileById = async (id) => {
  const file = await MediaFile.findById(id);
  if (!file) {
    throw new NotFoundError("Media file not found");
  }
  return toMediaDTO(file);
};


export const deleteMediaFile = async (id, userId, session = null) => {

  const execute = async (session) => {
    const mediaFile = await MediaFile.findById(id).session(session);

    if (!mediaFile) throw new NotFoundError("Media file not found");

    if (!userId || mediaFile.uploadedBy.toString() !== userId.toString()) {
      throw new UnauthorizedError("Not allowed to delete this file");
    }

    if (mediaFile.refCount > 0) {
      throw new ConflictError("File is still in use");
    }

    await deleteFromStorage(mediaFile.storageKey);
    await MediaFile.deleteOne({ _id: id }).session(session);
  };

  return session ? execute(session) : runInTransaction(execute);
};

export const bulkMediaDeleteFiles = async (ids, userId, session = null) => {

  const execute = async (session) => {
    const mediaFiles = await MediaFile.find({
      _id: { $in: ids }
    }).session(session);

    if (mediaFiles.length !== ids.length) {
      throw new NotFoundError("Some files not found");
    }

    for (const file of mediaFiles) {
      if (
        userId &&
        file.uploadedBy.toString() !== userId.toString()
      ) {
        throw new UnauthorizedError("Not allowed to delete some files");
      }

      if (file.refCount > 0) {
        throw new ConflictError(`File ${file._id} still in use`);
      }
    }

    await Promise.all(
      mediaFiles.map(f => deleteFromStorage(f.storageKey))
    );

    await MediaFile.deleteMany({
      _id: { $in: ids }
    }).session(session);

    return { deleted: ids.length };
  };

  return session ? execute(session) : runInTransaction(execute);
};

export const toMediaDTO = (doc) => ({
  id: doc._id.toString(),
  provider: doc.provider,
  fileName: doc.fileName,
  url: doc.url,
  mimeType: doc.mimeType,
  format: doc.format,
  size: doc.size,
  hash: doc.hash,
  uploadedBy: doc.uploadedBy,
  metadata: doc.metadata,
  refCount: doc.refCount,
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt
});


export const safelyDeleteMediaFileById = async (fileId, session = null) => {

  const execute = async (session) => {
    const deletedFile = await MediaFile.findOneAndDelete(
      {
        _id: fileId,
        refCount: { $lte: 0 }
      },
      { session }
    );

    if (!deletedFile) return;

    await deleteFromStorage(deletedFile.storageKey);

    return deletedFile;
  };

  return session ? execute(session) : runInTransaction(execute);
};

export const safelyBulkDeleteMediaFiles = async (fileIds, session = null) => {

  const execute = async (session) => {
    const filesToDelete = await MediaFile.find({
      _id: { $in: fileIds },
      refCount: { $lte: 0 }
    }).session(session);

    if (!filesToDelete.length) return;

    await Promise.all(
      filesToDelete.map(file =>
        deleteFromStorage(file.storageKey)
      )
    );

    await MediaFile.deleteMany({
      _id: { $in: filesToDelete.map(f => f._id) }
    }).session(session);
  };

  return session ? execute(session) : runInTransaction(execute);
};