import express from "express";
import * as profileController from "./baseProfile.controller.js";
import { validate } from "../../../middlewares/validation.middleware.js";
import {
  createProfileSchema,
  getProfilesQuerySchema,
  profileIdSchema,
  updateProfileSchema
} from "./baseProfile.validation.js";
import { protect} from "../../../middlewares/auth.middleware.js";
import { optionalUpload } from "../../../middlewares/multer.middleware.js";
import {
  parseMedia,
  strictMediaContext
} from "../../../middlewares/media.middlware.js";


const router = express.Router();

router.use(protect({
  isProfileCompleteCheck:false
}));

// ======================
// CREATE PROFILE
// ======================
router.post(
  "/",
  optionalUpload("file"),
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


router.put(
  "/",
  optionalUpload("file"),
  parseMedia("file", {
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"]
  }),
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

router.get("/byUser", profileController.getProfileByUser);

router.get("/:id",validate(profileIdSchema,"params"), profileController.getProfileById);

router.get("/",validate(getProfilesQuerySchema,"query"),profileController.getProfilesByQuery);

export default router;