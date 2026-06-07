import mongoose from "mongoose";
import { GROUP_CHAT_ROLES, GROUP_CHAT_ROLES_ARRAY } from "../constants/chat.constants.js";
import { MODELS } from "../constants/models.constants.js";

const { Schema, model, Types } = mongoose;

/* =========================
   GROUP CHAT MODEL
   =========================
   Purpose:
   - Multi-user conversations
   - Admin/member roles only
   - Permissions
   - Metadata
   - Optimized for MVP + production scaling
========================= */

const GroupChatSchema = new Schema(
  {
    /*
    Group metadata
    */
    name: {
      type: String,
      trim: true,
      required: true,
      maxlength: 100
    },

    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: ""
    },

    avatar: {
      type: Types.ObjectId,
      ref:MODELS.MEDIA_ASSET
    },

    /*
    Group creator
    */
    createdBy: {
      type: Types.ObjectId,
      ref: MODELS.USER,
      required: true,
      index: true
    },

    /*
    Members
    */
    members: [
      {
        userId: {
          type: Types.ObjectId,
          ref: "User",
          required: true
        },

        /*
        Role system:
        admin = full control
        member = standard participant
        */
        role: {
          type: String,
          enum: GROUP_CHAT_ROLES_ARRAY,
          default: GROUP_CHAT_ROLES.MEMBER
        },

        joinedAt: {
          type: Date,
          default: Date.now
        },

        leftAt: {
          type: Date,
          default: null
        },

        isActive: {
          type: Boolean,
          default: true
        }
      }
    ],

    /*
    Cached member count
    */
    memberCount: {
      type: Number,
      default: 0
    },

    /*
    Group settings
    */
    settings: {
      onlyAdminsCanMessage: {
        type: Boolean,
        default: false
      },

      onlyAdminsCanAddMembers: {
        type: Boolean,
        default: false
      },

      onlyAdminsCanEditGroup: {
        type: Boolean,
        default: true
      },

      messageHistoryVisibleToNewMembers: {
        type: Boolean,
        default: true
      }
    },

    /*
    Invite system
    */
    inviteCode: {
      type: String,
      default: null
    },

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
        default: ""
      },

      updatedAt: Date
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

GroupChatSchema.pre("validate", async function () {
  /*
  Active members only
  */
  const activeMembers = this.members.filter(
    member => member.isActive
  );

  /*
  Minimum 2 active users
  */
  if (activeMembers.length < 2) {
    throw new Error("Group chat must have at least 2 active members");
  }

  /*
  Prevent duplicate users
  */
  const userIds = activeMembers.map(member =>
    member.userId.toString()
  );

  if (new Set(userIds).size !== userIds.length) {
    throw new Error("Duplicate members are not allowed");
  }

  /*
  At least one admin required
  */
  const adminCount = activeMembers.filter(
    member => member.role === GROUP_CHAT_ROLES.ADMIN
  ).length;

  if (adminCount < 1) {
    throw new Error("Group chat must have at least one admin");
  }

  /*
  Creator should remain active member
  */
  const creatorExists = activeMembers.some(
    member =>
      member.userId.toString() === this.createdBy.toString()
  );

  if (!creatorExists) {
    throw new Error("Group creator must remain an active member");
  }

  /*
  Sync cached member count
  */
  this.memberCount = activeMembers.length;
});

/* =========================
   INDEXES
========================= */

/*
Fast user group lookup
*/
GroupChatSchema.index({
  "members.userId": 1,
  isDeleted: 1,
  isArchived: 1
});

/*
Search support
*/
GroupChatSchema.index({
  name: "text",
  description: "text"
});

/*
Lifecycle filtering
*/
GroupChatSchema.index({
  isArchived: 1,
  isDeleted: 1
});

/*
Creator lookup
*/
GroupChatSchema.index({
  createdBy: 1
});

/*
Invite code lookup
*/
GroupChatSchema.index({
  inviteCode: 1
});

/* =========================
   EXPORT
========================= */

export const GroupChat = model(
  MODELS.GROUP_CHAT,
  GroupChatSchema
);