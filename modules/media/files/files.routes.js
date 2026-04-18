import express from "express";
import { requireUpload } from "../../../middlewares/multer.middleware.js";
import {
  createMediaFile,
  getAllMediaFiles,
  getMediaFileById,
  deleteMediaFile,
  bulkDeleteMediaFiles
} from "./files.controller.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { protect } from "../../../middlewares/auth.middleware.js";
import { validate } from "../../../middlewares/validation.middleware.js";
import {getAllMediaFilesSchema, mediaFileIdSchema , bulkDeleteSchema} from "./files.validation.js"
import { parseMedia } from "../../../middlewares/media.middlware.js";

const router = express.Router();


// CREATE
router.post("/",
  protect, 
  requireUpload("file"),
  parseMedia("file"), 
  asyncHandler(createMediaFile)
);


router.get(
  "/",
  validate(getAllMediaFilesSchema, "query"),
  asyncHandler(getAllMediaFiles)
);


router.get(
  "/:id",
  validate(mediaFileIdSchema, "params"),
  asyncHandler(getMediaFileById)
);



router.delete(
  "/:id",
  protect,
  validate(mediaFileIdSchema, "params"),
  asyncHandler(deleteMediaFile)
);


router.delete(
  "/bulk-delete",
  protect,
  validate(bulkDeleteSchema),
  asyncHandler(bulkDeleteMediaFiles)
);


export default router;