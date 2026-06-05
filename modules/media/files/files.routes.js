import express from "express";
import {
  createMediaFile,
  getAllMediaFiles,
  getMediaFileById,
  deleteMediaFile,
  bulkDeleteMediaFiles
} from "./files.controller.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { protect, restrictTo } from "../../../middlewares/protect.middleware.js";
import { validate } from "../../../middlewares/validate.middleware.js";
import {getAllMediaFilesSchema, mediaFileIdSchema , bulkDeleteSchema} from "./files.validation.js"
import { USER_ROLES } from "../../../constants/user.constants.js";

const router = express.Router();


// CREATE
router.post("/", 
  protect({requireBaseProfile:true}),
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
  protect(),
  validate(mediaFileIdSchema, "params"),
  asyncHandler(deleteMediaFile)
);


router.delete(
  "/bulk-delete",
  protect(),
  restrictTo(USER_ROLES.ADMIN),
  validate(bulkDeleteSchema),
  asyncHandler(bulkDeleteMediaFiles)
);


export default router;