import { createAsset,getAllAssets,getAssetById,deleteAsset,bulkDeleteAssets,updateAsset } from "./assets.service.js";

// ------------------------
// CREATE MediaAsset
// ------------------------
export const createMediaAsset = async (req, res) => {
  const { title, slug, usageType, namespace, file} = req.validated?.body;
  const uploadedBy = req.user?.id;

  const mediaAsset = await createAsset({
    title,
    slug,
    usageType,
    namespace,
    file,
    uploadedBy
  });

  return res.status(201).json({ mediaAsset });
};

// ------------------------
// READ ALL MediaAssets
// ------------------------
export const getAllMediaAssets = async (req, res) => {
  const filters = req.validated?.query;
  const mediaAssets = await getAllAssets(filters);
  return res.status(200).json({ mediaAssets });
};

// ------------------------
// READ ONE MediaAsset
// ------------------------
export const getMediaAssetById = async (req, res) => {
  const { id:mediaAssetId } = req.validated?.params;
  const mediaAsset = await getAssetById(mediaAssetId);
  return res.status(200).json({ mediaAsset });
};

// ------------------------
// UPDATE MediaAsset (metadata only)
// ------------------------
export const updateMediaAsset = async (req, res) => {
  const { id : mediaAssetId } = req.validated?.params;
  const updates = req.validated?.body;
  const updatedBy = req.user?.id;
  const updatedAsset = await updateAsset(mediaAssetId, updates, updatedBy);
  return res.status(200).json({ mediaAsset: updatedAsset });
};

// ------------------------
// DELETE SINGLE MediaAsset
// ------------------------
export const deleteMediaAsset = async (req, res) => {
  const { id :mediaAssetId } = req.validated?.params;
  const deletedBy = req.user?.id;
  await deleteAsset(mediaAssetId, deletedBy);
  return res.status(200).json({ message: "Media asset deleted successfully" });
};

// ------------------------
// BULK DELETE MediaAssets
// ------------------------
export const bulkDeleteMediaAssets = async (req, res) => {
  const { mediaAssetIds } = req.validated?.body;
  const deletedBy = req.user?.id;
  await bulkDeleteAssets(mediaAssetIds, deletedBy);
  return res.status(200).json({ message: "Bulk delete successful" });
};