import mongoose from "mongoose";
import {
  email_log_status_array,
  EMAIL_LOG_STATUS_TYPES
} from "../email.constants.js";

const emailLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true
    },

    to: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true
    },

    type: {
      type: String,
      required: true,
      index: true
    },

    subject: {
      type: String,
      trim: true
    },

    status: {
      type: String,
      enum: email_log_status_array,
      default: EMAIL_LOG_STATUS_TYPES.PENDING,
      index: true
    },

    provider: {
      type: String,
      index: true
    },

    messageId: {
      type: String,
      index: true
    },

    error: {
      message: {
        type: String
      },
      stack: {
        type: String
      }
    },

    meta: {
      type: mongoose.Schema.Types.Mixed // ✅ flexible + safe
    },

    // ✅ TTL handled here
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 60 * 60 * 24 * 30 // 30 days in seconds
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// ✅ Indexes
emailLogSchema.index({ createdAt: -1 });
emailLogSchema.index({ status: 1, type: 1 });
emailLogSchema.index({ to: 1, type: 1 });
emailLogSchema.index({ messageId: 1 });

// ❌ Prevent model overwrite in dev (hot reload safe)
export default mongoose.models.EmailLog ||
  mongoose.model("EmailLog", emailLogSchema);