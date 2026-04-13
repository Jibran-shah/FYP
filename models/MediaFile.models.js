import mongoose from "mongoose";

const mediaFileSchema = new mongoose.Schema(
  {
    // 🌍 Storage provider info
    provider: {
      name: {
        type: String,
        enum: ["local", "aws-s3", "cloudinary"],
        default: "local",
        index: true
      },
      bucket: String,
      region: String
    },

    // 📄 Original file name
    fileName: {
      type: String,
      required: true,
      trim: true
    },

    // 🔑 Storage key (unique identifier in storage)
    storageKey: {
      type: String,
      required: true,
      unique: true,
      index: true
    },

    // 🔗 Public URL (can be CDN or local)
    url: {
      type: String,
      required: true,
      trim: true
    },

    // 🧾 MIME type (source of truth)
    mimeType: {
      type: String,
      required: true,
      index: true
    },

    // 🧩 Format (derived, but stored for fast querying)
    format: {
      type: String,
      required: true,
      index: true
    },

    // 📦 File size (bytes)
    size: {
      type: Number,
      required: true
    },

    // 🔐 Hash
    hash: {
      type: String,
      required: true,
      index: true
    },

    // 👤 Ownership
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required:true,
      index: true
    },
     // 🔥 Flexible, universal metadata
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
      index: true
    },
    // 🔁 Reference counting (VERY IMPORTANT)
    refCount: {
      type: Number,
      default: 0,
      min: 0,
      index: true,
    },
  },
  { timestamps: true }
);


mediaFileSchema.index({ uploadedBy: 1, createdAt: -1 });


export const MediaFile = mongoose.model("MediaFile", mediaFileSchema);