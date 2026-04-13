import mongoose from "mongoose";
import { DEFAULTS, PROFILE_ROLE_TYPES } from "../constants/profile.constants.js";

const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80
    },

    profileImage: {
      type: mongoose.Schema.Types.ObjectId,
      ref:"MediaAsset"
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
        type: String,
        enum: PROFILE_ROLE_TYPES,
        default: DEFAULTS.role
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model("Profile", profileSchema);