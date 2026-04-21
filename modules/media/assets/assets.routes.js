// routes/mediaAsset.routes.js
import express from "express";
import { 
  createMediaAsset,
  getAllMediaAssets,
  getMediaAssetById,
  updateMediaAsset,
  deleteMediaAsset,
  bulkDeleteMediaAssets
} from "./assets.controller.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { bulkDeleteMediaAssetsSchema, createMediaAssetSchema, getAllMediaAssetsQuerySchema, mediaAssetIdParamSchema, updateMediaAssetSchema } from "./assets.validation.js";
import {validate} from "../../../middlewares/validation.middleware.js"
import { protect } from "../../../middlewares/auth.middleware.js";

const router = express.Router();


router.use(protect())

// ------------------------
// CREATE
// ------------------------
router.post(
  "/",
  validate(createMediaAssetSchema),
  asyncHandler(createMediaAsset)
);

// ------------------------
// READ ALL
// ------------------------
router.get(
  "/",
  validate(getAllMediaAssetsQuerySchema, "query"),
  asyncHandler(getAllMediaAssets)
);

// ------------------------
// BULK DELETE (put before :id)
// ------------------------
router.delete(
  "/bulk-delete",
  validate(bulkDeleteMediaAssetsSchema),
  asyncHandler(bulkDeleteMediaAssets)
);

// ------------------------
// READ ONE
// ------------------------
router.get(
  "/:id",
  validate(mediaAssetIdParamSchema, "params"),
  asyncHandler(getMediaAssetById)
);

// ------------------------
// UPDATE
// ------------------------
router.put(
  "/:id",
  validate(mediaAssetIdParamSchema, "params"),
  validate(updateMediaAssetSchema, "body"),
  asyncHandler(updateMediaAsset)
);

// ------------------------
// DELETE SINGLE
// ------------------------
router.delete(
  "/:id",
  validate(mediaAssetIdParamSchema, "params"),
  asyncHandler(deleteMediaAsset)
);

export default router;