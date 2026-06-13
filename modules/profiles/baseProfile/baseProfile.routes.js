import express from "express";
import * as profileController from "./baseProfile.controller.js";
import { validate } from "../../../middlewares/validate.middleware.js";
import {
  createProfileSchema,
  fullProfileSchema,
  getProfilesQuerySchema,
  profileIdSchema,
  updateProfileSchema
} from "./baseProfile.validation.js";
import { protect} from "../../../middlewares/protect.middleware.js";
import {mediaContext} from "../../../middlewares/mediaContext.middlware.js"
import { FILE_MAX_SIZES, MEDIA_USAGE_TYPES, NAMESPACES } from "../../../constants/media.constants.js";
import { createUpload } from "../../../middlewares/upload.middleware.js";


const router = express.Router();


// ======================
// CREATE PROFILE
// ======================
router.post(
  "/",
  protect(),
  createUpload({fields:[
    {
      name:"profileAvatar",
      maxCount:1,
      required:false,
      types:["image/jpeg","image/png"],
      maxSize:FILE_MAX_SIZES.PROFILE_AVATAR
    },
    {
      name:"profileCover",
      maxCount:1,
      required:false,
      types:["image/jpeg","image/png"],
      maxSize:FILE_MAX_SIZES.PROFILE_COVER
    }
  ]}),
  mediaContext({
    fields:{
      profileAvatar:{
        namespace:NAMESPACES.PROFILE_AVATAR,
        usageType:MEDIA_USAGE_TYPES.PROFILE_AVATAR
      },
      profileCover:{
        namespace:NAMESPACES.PROFILE_COVER,
        usageType:MEDIA_USAGE_TYPES.PROFILE_COVER
      }
    }
  }),
  validate(createProfileSchema),
  profileController.createProfile
);


router.put(
  "/",
  protect({requireBaseProfile:true}),
  createUpload({fields:[
    {
      name:"profileAvatar",
      maxCount:1,
      required:false,
      types:["image/jpeg","image/png"],
      maxSize:FILE_MAX_SIZES.PROFILE_AVATAR
    },
    {
      name:"profileCover",
      maxCount:1,
      required:false,
      types:["image/jpeg","image/png"],
      maxSize:FILE_MAX_SIZES.PROFILE_COVER
    }
  ]}),
  mediaContext({
    fields:{
      profileAvatar:{
        namespace:NAMESPACES.PROFILE_AVATAR,
        usageType:MEDIA_USAGE_TYPES.PROFILE_AVATAR
      },
      profileCover:{
        namespace:NAMESPACES.PROFILE_COVER,
        usageType:MEDIA_USAGE_TYPES.PROFILE_COVER
      }
    }
  }),
  validate(updateProfileSchema),
  profileController.updateProfile
);

router.delete("/",protect({requireBaseProfile:true}), profileController.deleteProfile);

router.get("/byUser",protect({requireBaseProfile:true}), profileController.getProfileByUser);

router.get("/:id",validate(profileIdSchema,"params"), profileController.getProfileById);

router.get("/",validate(getProfilesQuerySchema,"query"),profileController.getProfilesByQuery);

router.get(
  "/full/:id",
  protect(),
  validate(fullProfileSchema, "params"),
  profileController.getFullProfile
);

export default router;