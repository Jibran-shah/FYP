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
import {validate} from "../../../middlewares/validate.middleware.js"
import { protect, restrictTo } from "../../../middlewares/protect.middleware.js";
import { USER_ROLES } from "../../../constants/user.constants.js";

const router = express.Router();

// ------------------------
// CREATE
// ------------------------
router.post(
  "/",
  protect({requireBaseProfile:true}),
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
  protect({requireBaseProfile:true}),
  restrictTo(USER_ROLES.ADMIN),
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
  protect({requireBaseProfile:true}),
  validate(mediaAssetIdParamSchema, "params"),
  validate(updateMediaAssetSchema, "body"),
  asyncHandler(updateMediaAsset)
);

// ------------------------
// DELETE SINGLE
// ------------------------
router.delete(
  "/:id",
  protect({requireBaseProfile:true}),
  validate(mediaAssetIdParamSchema, "params"),
  asyncHandler(deleteMediaAsset)
);

export default router;