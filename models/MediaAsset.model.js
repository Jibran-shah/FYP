import mongoose from "mongoose";
import { DEFAULTS, MEDIA_USAGE_TYPES } from "../constants/media.constants.js";


const mediaAssetSchema = new mongoose.Schema(
  {
    // 👤 Ownership
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required:true,
      index: true
    },

    // 🏷 Human-readable title
    title: {
      type: String,
      trim: true,
      default: DEFAULTS.title
    },

    // 🔗 Slug (unique identifier)
    slug: {
      type: String,
      trim: true,
      lowercase: true,
      required:true,
      index: true
    },

    // 🔗 Reference to physical file
    file: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MediaFile",
      required: true,
      index: true
    },

    // 🎯 Logical usage (NOT file type)
    usageType: {
      type: String,
      enum: MEDIA_USAGE_TYPES,
      default: DEFAULTS.usageType,
      index: true
    },

    // 🧠 Hierarchical classification
    namespace: {
      type: String,
      default: DEFAULTS.namespace,
      index: true,
      trim: true,
      lowercase: true
    },

    // 🔥 Flexible metadata
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  { timestamps: true }
);


mediaAssetSchema.index(
  { 
    slug: 1, 
    uploadedBy: 1 
  },
  { unique: true }
);

mediaAssetSchema.index(
  { 
    namespace: 1, 
    usageType: 1, 
    uploadedBy: 1 
  }
);

mediaAssetSchema.index({ createdAt: -1 });

export const MediaAsset = mongoose.model("MediaAsset", mediaAssetSchema);