import mongoose from "mongoose";
import { MODELS } from "../constants/models.constants.js";

const { Schema, Types, model } = mongoose;

/* =========================
   MESSAGE TYPES
========================= */
export const MESSAGE_TYPES = {
  TEXT: "text",
  IMAGE: "image",
  VIDEO: "video",
  AUDIO: "audio",
  FILE: "file",
  SYSTEM: "system"
};

export const MESSAGE_TYPES_ARRAY = Object.values(MESSAGE_TYPES);

/* =========================
   MESSAGE SCHEMA
========================= */
const messageSchema = new Schema(
  {
    /* =========================
       CHAT (DIRECT OR GROUP)
    ========================= */
    chatId: {
      type: Types.ObjectId,
      required: true,
      index: true,
      refPath: "chatModel"
    },

    chatModel: {
      type: String,
      required: true,
      enum: ["DirectChat", "GroupChat"],
      default: "DirectChat"
    },

    /* =========================
       SENDER
    ========================= */
    senderId: {
      type: Types.ObjectId,
      ref: MODELS.USER,
      required: true,
      index: true
    },

    /* =========================
       TEMP ID (CLIENT TRACKING + DEDUPE)
    ========================= */
    tempId: {
      type: String,
      index: true,
      sparse: true
    },

    /* =========================
       MESSAGE TYPE
    ========================= */
    type: {
      type: String,
      enum: MESSAGE_TYPES_ARRAY,
      default: MESSAGE_TYPES.TEXT,
      index: true
    },

    /* =========================
       CONTENT
    ========================= */
    text: {
      type: String,
      trim: true,
      maxlength: 5000,
      default: ""
    },

    /* =========================
       MEDIA
    ========================= */
    media: [
      {
        type: Types.ObjectId,
        ref: MODELS.MEDIA_ASSET
      }
    ],

    /* =========================
       REPLY SUPPORT
    ========================= */
    replyTo: {
      type: Types.ObjectId,
      ref: MODELS.MESSAGE,
      default: null
    },

    /* =========================
       STATUS TRACKING
    ========================= */
    deliveredAt: [
      {
        userId: {
          type: Types.ObjectId,
          ref: MODELS.USER
        },
        at: Date
      }
    ],

    readAt: [
      {
        userId: {
          type: Types.ObjectId,
          ref: MODELS.USER
        },
        at: Date
      }
    ],

    /* =========================
       EDITING
    ========================= */
    isEdited: {
      type: Boolean,
      default: false
    },

    editedAt: Date,

    /* =========================
       DELETION
    ========================= */
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

/* =========================
   INDEXES
========================= */
messageSchema.index({ chatId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1, createdAt: -1 });
messageSchema.index({ replyTo: 1 });
messageSchema.index({ tempId: 1 }); // IMPORTANT

/* =========================
   VALIDATION RULES
========================= */
messageSchema.pre("validate", function (next) {
  const hasText = this.text && this.text.trim().length > 0;
  const hasMedia = this.media && this.media.length > 0;

  const mediaTypes = ["image", "video", "audio", "file"];

  // TEXT / SYSTEM must have content
  if (this.type === "text" || this.type === "system") {
    if (!hasText && !hasMedia) {
      return next(new Error("Message must contain text or media"));
    }
  }

  // Media types must have media
  if (mediaTypes.includes(this.type)) {
    if (!hasMedia) {
      return next(new Error(`${this.type} message must contain media`));
    }
  }

  next();
});

/* =========================
   EXPORT MODEL
========================= */
export const Message =
  mongoose.models.Message || model(MODELS.MESSAGE, messageSchema);