import { createMediaFile } from "./files/files.service.js";
import { BadRequestError } from "../../errors/Http.error.js";
import { MediaFile } from "../../models/MediaFile.models.js";
import { createAsset, deleteAsset } from "./assets/assets.service.js";

/* =========================================================
   assertMediaOwnership
   ---------------------------------------------------------
   Validates that a media file exists and belongs to the user
   before it can be reused or linked to an asset.
========================================================= */

/**
 * Validates ownership of a media file.
 *
 * @param {Object} params
 * @param {string} params.fileId - Media file ID to validate
 * @param {string} params.userId - ID of requesting user
 *
 * @returns {Promise<Object>} MediaFile document if valid
 *
 * @throws {BadRequestError} If file does not exist or user does not own it
 */
export const assertMediaOwnership = async ({ fileId, userId }) => {
  const file = await MediaFile.findById(fileId);

  if (!file) {
    throw new BadRequestError("Media file not found");
  }

  if (file.uploadedBy.toString() !== userId.toString()) {
    throw new BadRequestError("You do not own this media file");
  }

  return file;
};

/* =========================================================
   mediaService
   ---------------------------------------------------------
   Central service responsible for:
   - Resolving uploaded files into assets
   - Reusing existing media file IDs
   - Enforcing ownership rules
   - Creating assets with context metadata
   - Deleting assets safely
========================================================= */

/**
 * Media service for handling file-to-asset resolution and deletion.
 */
export const mediaService = {

  /* =========================================================
     resolve
     ---------------------------------------------------------
     Normalizes mixed media inputs (files + fileIds)
     into a unified list of asset IDs.
  ========================================================= */

  /**
   * Resolves uploaded files and existing file IDs into asset IDs.
   *
   * @param {Object} params
   * @param {Array<Object>} params.files - Newly uploaded files
   * @param {Array<string>} params.fileIds - Existing media file IDs
   * @param {Object} params.context - Metadata context (owner, usageType, namespace, entity)
   * @param {string} params.userId - Requesting user ID
   * @param {Object} params.session - Database transaction session
   *
   * @returns {Promise<Array<string>>} Array of created asset IDs
   */
  async resolve({
    files = [],
    fileIds = [],
    context,
    userId,
    session
  }) {

    const assetIds = [];

    for (const file of files) {
      const assetId = await this._createFromFile({
        file,
        context,
        session
      });

      if (assetId) assetIds.push(assetId);
    }

    for (const fileId of fileIds) {
      const assetId = await this._createFromFileId({
        fileId,
        context,
        session
      });

      if (assetId) assetIds.push(assetId);
    }

    return assetIds;
  },

  /* =========================================================
     _createFromFile
     ---------------------------------------------------------
     Handles raw file upload flow:
     File → MediaFile → Asset
  ========================================================= */

  /**
   * Creates a MediaFile and wraps it into an Asset.
   *
   * @param {Object} params
   * @param {Object} params.file - Uploaded file object
   * @param {Object} params.context - Ownership + usage metadata
   * @param {Object} params.session - DB transaction session
   *
   * @returns {Promise<string>} Asset ID
   */
  async _createFromFile({ file, context, session }) {
    const mediaFile = await createMediaFile(
      {
        file,
        uploadedBy: context.owner
      },
      session
    );

    const asset = await createAsset(
      {
        file: mediaFile.id,
        uploadedBy: context.owner,
        usageType: context.usageType,
        namespace: context.namespace
      },
      session
    );

    return asset._id;
  },

  /* =========================================================
     _createFromFileId
     ---------------------------------------------------------
     Reuses an existing MediaFile ID:
     Ownership → Asset creation only
  ========================================================= */

  /**
   * Creates an Asset from an existing MediaFile ID.
   *
   * @param {Object} params
   * @param {string} params.fileId - Existing media file ID
   * @param {Object} params.context - Usage metadata context
   * @param {string} params.userId - Requesting user ID
   * @param {Object} params.session - DB transaction session
   *
   * @returns {Promise<string>} Asset ID
   */
  async _createFromFileId({ fileId, context, session }) {
    await assertMediaOwnership({
      fileId,
      userId:context.owner
    });

    const asset = await createAsset(
      {
        file: fileId,
        uploadedBy: context.owner,
        usageType: context.usageType,
        namespace: context.namespace
      },
      session
    );

    return asset._id;
  },

  /* =========================================================
     remove
     ---------------------------------------------------------
     Deletes an asset safely with ownership validation
     (handled internally by deleteAsset service).
  ========================================================= */

  /**
   * Deletes an asset by ID.
   *
   * @param {string} assetId - Asset to delete
   * @param {string} userId - Requesting user ID
   * @param {Object} session - DB transaction session
   *
   * @returns {Promise<any>} Result from delete operation
   */
  async remove(assetId, userId, session) {
    if (!assetId) return;
    return deleteAsset(assetId, userId, session);
  }
};