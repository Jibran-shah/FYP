import express from "express";
import * as profileController from "./baseProfile.controller.js";
import { validate } from "../../../middlewares/validate.middleware.js";
import {
  createProfileSchema,
  updateProfileSchema
} from "./baseProfile.validation.js";
import { protect, restrictTo } from "../../../middlewares/auth.middleware.js";
import { upload } from "../../../middlewares/multer.middleware.js";
import {
  parseMedia,
  strictMediaContext
} from "../../../middlewares/media.middlware.js";


const router = express.Router();

router.use(protect);

// ======================
// CREATE PROFILE
// ======================
router.post(
  "/",
  upload.single("file"),
  parseMedia("file", {
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"]
  }),
  strictMediaContext({
    entity: "profile",
    usageType: "profileImage",
    namespace: "profile",
    ownerFrom: "user"
  }),
  validate(createProfileSchema),
  profileController.createProfile
);


// ======================
// GET PROFILE
// ======================
router.get("/", profileController.getProfile);


router.put(
  "/",
  upload.single("file"),
  parseMedia("file", {
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"]
  }),
  validateFileOrFileId, // 🔥 ADD THIS
  strictMediaContext({
    entity: "profile",
    usageType: "profileImage",
    namespace: "profile",
    ownerFrom: "user"
  }),
  validate(updateProfileSchema),
  profileController.updateProfile
);


// ======================
// DELETE
// ======================
router.delete("/", profileController.deleteProfile);

export default router;