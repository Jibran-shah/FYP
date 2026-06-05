import mongoose from "mongoose";
import { MODELS } from "../constants/models.constants.js";

const { Schema, model, Types } = mongoose;

/* =========================
   DIRECT CHAT MODEL
   =========================
   Purpose:
   - One-to-one conversations
   - Exactly 2 unique users
   - Lightweight architecture
   - Fast retrieval
   - Real-time optimized
========================= */

const DirectChatSchema = new Schema(
  {
    /*
    Exactly 2 participants
    */
    participants: [
      {
        type: Types.ObjectId,
        ref: MODELS.USER,
        required: true
      }
    ],

    /*
    Cached last message preview
    */
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
    Per-user soft deletion
    Allows:
    - "Delete for me"
    - Hide chat from user
    */
    deletedFor: [
      {
        type: Types.ObjectId,
        ref: "User"
      }
    ],

    /*
    User blocking system
    If blocked, messaging disabled
    */
    blockedBy: {
      type: Types.ObjectId,
      ref: MODELS.USER,
      default: null
    },

    /*
    Lifecycle state
    */
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

DirectChatSchema.pre("validate", function (next) {
  /*
  Must contain exactly 2 users
  */
  if (this.participants.length !== 2) {
    return next(
      new Error(
        "Direct chat must contain exactly 2 participants"
      )
    );
  }

  /*
  Prevent duplicate participants
  */
  const participantIds = this.participants.map(id =>
    id.toString()
  );

  if (
    new Set(participantIds).size !==
    participantIds.length
  ) {
    return next(
      new Error(
        "Direct chat participants must be unique"
      )
    );
  }

  /*
  Validate deletedFor users belong to participants
  */
  if (this.deletedFor?.length) {
    for (const deletedUser of this.deletedFor) {
      if (
        !participantIds.includes(
          deletedUser.toString()
        )
      ) {
        return next(
          new Error(
            "deletedFor contains invalid participant"
          )
        );
      }
    }
  }

  /*
  Validate blockedBy belongs to participants
  */
  if (
    this.blockedBy &&
    !participantIds.includes(
      this.blockedBy.toString()
    )
  ) {
    return next(
      new Error(
        "blockedBy must be one of the participants"
      )
    );
  }

  next();
});

/* =========================
   INDEXES
========================= */

/*
Fast participant chat lookup
*/
DirectChatSchema.index({
  participants: 1,
  isDeleted: 1,
  isArchived: 1
});

/*
Block lookup
*/
DirectChatSchema.index({
  blockedBy: 1
});

/*
Soft delete lookup
*/
DirectChatSchema.index({
  deletedFor: 1
});

/*
Prevent duplicate direct chats
Application layer should also sort participants
before creation for consistency
*/
DirectChatSchema.index({
  participants: 1
});

/* =========================
   STATIC METHOD
========================= */

/*
Find existing direct chat between 2 users
*/
DirectChatSchema.statics.findBetweenUsers =
  function (userA, userB) {
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