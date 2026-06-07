import mongoose from "mongoose";
import { MODELS } from "../constants/models.constants.js";

const { Schema, model, Types } = mongoose;

/* =========================
   DIRECT CHAT MODEL
========================= */

const DirectChatSchema = new Schema(
  {
    participants: [
      {
        type: Types.ObjectId,
        ref: MODELS.USER,
        required: true
      }
    ],

    lastMessage: {
      messageId: {
        type: Types.ObjectId,
        ref: MODELS.MESSAGE
      },
      senderId: {
        type: Types.ObjectId,
        ref: MODELS.USER
      },
      content: {
        type: String,
        trim: true,
        default: ""
      },
      updatedAt: Date
    },

    /*
    FIXED: ensure consistent array of ObjectIds
    */
    deletedFor: [
      {
        type: Types.ObjectId,
        ref: MODELS.USER,
        default: null
      }
    ],

    /*
    FIXED: also support multiple blockers (future-proof)
    but keeping backward-compatible structure
    */
    blockedBy: [
      {
        type: Types.ObjectId,
        ref: MODELS.USER,
        default: null
      }
    ],

    isArchived: {
      type: Boolean,
      default: false,
      index: true
    },

    isDeleted: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

/* =========================
   VALIDATION
========================= */

DirectChatSchema.pre("validate", async function () {
  if (!Array.isArray(this.participants)) {
    throw new Error("participants must be an array");
  }

  if (this.participants.length !== 2) {
    throw new Error("Direct chat must contain exactly 2 participants");
  }

  const participantIds = this.participants.map(id => id.toString());

  if (new Set(participantIds).size !== participantIds.length) {
    throw new Error("Direct chat participants must be unique");
  }

  /*
  deletedFor must be subset of participants
  */
  if (Array.isArray(this.deletedFor) && this.deletedFor.length) {
    for (const user of this.deletedFor) {
      if (!participantIds.includes(user.toString())) {
        throw new Error("deletedFor contains invalid participant");
      }
    }
  }

  /*
  blockedBy must be subset of participants (array version)
  */
  if (Array.isArray(this.blockedBy) && this.blockedBy.length) {
    for (const user of this.blockedBy) {
      if (!participantIds.includes(user.toString())) {
        throw new Error("blockedBy contains invalid participant");
      }
    }
  }
});

/* =========================
   INDEXES
========================= */

/*
Chat lookup
*/
DirectChatSchema.index({
  participants: 1,
  isDeleted: 1,
  isArchived: 1
});

/*
IMPORTANT FIX:
Array fields should use multikey index explicitly
*/
DirectChatSchema.index({
  deletedFor: 1
});

DirectChatSchema.index({
  blockedBy: 1
});

/*
Prevent duplicate direct chats
*/
DirectChatSchema.index({
  participants: 1
});

/* =========================
   STATIC METHOD
========================= */

DirectChatSchema.statics.findBetweenUsers = function (userA, userB) {
  return this.findOne({
    participants: {
      $all: [userA, userB],
      $size: 2
    },
    isDeleted: false
  });
};

/* =========================
   EXPORT
========================= */

export const DirectChat = model(
  MODELS.DIRECT_CHAT,
  DirectChatSchema
);