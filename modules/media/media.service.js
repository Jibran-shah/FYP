import { createMediaFile } from "./files/files.service.js";
import { BadRequestError } from "../../errors/Http.error.js";
import { MediaFile } from "../../models/MediaFile.models.js";
import { createAsset, deleteAsset } from "./assets/assets.service.js";


export const mediaService = {

    async resolve({
    file,
    fileId,
    context,
    userId,
    session
  }) {
    let assetId = null;

    // -----------------------------
    // CASE 1: NEW FILE UPLOAD
    // -----------------------------
    if (file) {
      const mediaFile = await createMediaFile({
        file,
        uploadedBy: context.owner,
        session
      });

      const asset = await createAsset({
        file: mediaFile._id,
        uploadedBy: context.owner,
        usageType:context.usageType,
        namespace:context.namespace,
        session
      });

      return asset._id;
    }

    // -----------------------------
    // CASE 2: REUSE EXISTING FILE
    // -----------------------------
    if (fileId) {
      await assertMediaOwnership({
        fileId,
        userId
      });

      const asset = await createAsset({
        file: fileId,
        uploadedBy: userId,
        usageType:context.usageType,
        usageType:context.namespace,
        session
      });

      return asset._id;
    }

    // -----------------------------
    // CASE 3: NO MEDIA
    // -----------------------------
    return null;
  },

  /**
   * OPTIONAL: SAFE DELETE
   */
  async remove(assetId, userId, session) {
    if (!assetId) return;

    await deleteAsset(assetId, userId, session);
  },


  /**
   * Upload single media
   */
  async upload({
    file,
    context,
    session = null
  }) {
    if (!file) return null;

    if (!context?.owner) {
      throw new Error("Media context owner missing");
    }

    // 1. Create MediaFile
    const mediaFile = await createMediaFile({
      file,
      uploadedBy: context.owner,
      session
    });

    // 2. Create MediaAsset
    const asset = await createAsset({
      file: mediaFile._id,
      uploadedBy: context.owner,
      usageType: context.usageType,
      namespace: context.namespace,
      entity: context.entity,
      session
    });

    return asset;
  },

  /**
   * Upload multiple files
   */
  async uploadMany({
    files = [],
    context,
    session = null
  }) {
    const results = [];

    for (const file of files) {
      const asset = await this.upload({
        file,
        context,
        session
      });

      if (asset) results.push(asset);
    }

    return results;
  }
};

export const assertMediaOwnership = async ({
  fileId,
  userId
}) => {
  const file = await MediaFile.findById(fileId);

  if (!file) {
    throw new BadRequestError("Media file not found");
  }

  if (file.uploadedBy.toString() !== userId.toString()) {
    throw new BadRequestError("You do not own this media file");
  }

  return file;
};