import mongoose from "mongoose";
import { PROFILE_ROLE_TYPES_ARRAY, PROFILE_ROLE_TYPES } from "../constants/profile.constants.js";
import { MODELS } from "../constants/models.constants.js";

const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: MODELS.USER,
      required: true,
      unique: true
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80
    },

    profileAvatar: {
      type: mongoose.Schema.Types.ObjectId,
      ref:MODELS.MEDIA_ASSET
    },

    profileCover: {
      type: mongoose.Schema.Types.ObjectId,
      ref:MODELS.MEDIA_ASSET
    },

    phone: {
      type: String,
      trim: true
    },

    bio: {
      type: String,
      maxlength: 500
    },

    country: {
      type: String
    },

    city: {
      type: String
    },

    address: {
      type: String
    },

    role: {
        type: [String],
        enum: PROFILE_ROLE_TYPES_ARRAY,
        default: [PROFILE_ROLE_TYPES.BUYER],
        index:true
    }
  },
  {
    timestamps: true
  }
);

const Profile = mongoose.models.Profile || mongoose.model(MODELS.PROFILE, profileSchema);

export default Profile;