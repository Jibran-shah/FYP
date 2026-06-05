import mongoose from "mongoose";
import {
  MESSAGE_CATEGORIES,
  MESSAGE_CATEGORIES_ARRAY,
  MESSAGE_STATUSES,
  MESSAGE_STATUSES_ARRAY
} from "../constants/chat.constants";
import { MODELS } from "../constants/models.constants";

const { Schema, model, Types } = mongoose;

const messageSchema = new Schema(
  {
    /*
    Chat reference
    */
    chatId: {
      type: Types.ObjectId,
      ref: MODELS.DIRECT_CHAT,
      required: true,
      index: true
    },

    /*
    Sender
    */
    senderId: {
      type: Types.ObjectId,
      ref: MODELS.USER,
      required: true,
      index: true
    },

    /*
    Message type
    */
    type: {
      type: String,
      enum: MESSAGE_CATEGORIES_ARRAY,
      default: MESSAGE_CATEGORIES.TEXT,
      required: true,
      index: true
    },

    /*
    Text content
    */
    content: {
      type: String,
      trim: true,
      maxlength: 5000,
      default: ""
    },

    /*
    Media references (ONLY pointers)
    Media access is controlled via MediaAttachment model
    */
    mediaAssets: [
      {
        type: Types.ObjectId,
        ref: MODELS.MEDIA_ASSET
      }
    ],

    /*
    Reply support
    */
    replyTo: {
      type: Types.ObjectId,
      ref: MODELS.MESSAGE,
      default: null,
      index: true
    },

    /*
    Message status
    */
    status: {
      type: String,
      enum: MESSAGE_STATUSES_ARRAY,
      default: MESSAGE_STATUSES.SENT,
      index: true
    },

    /*
    Delivery + read tracking
    */
    delivery: [
      {
        userId: {
          type: Types.ObjectId,
          ref: MODELS.USER,
          required: true
        },
        deliveredAt: {
          type: Date,
          default: null
        },
        readAt: {
          type: Date,
          default: null
        }
      }
    ],

    /*
    Edit tracking
    */
    edited: {
      isEdited: {
        type: Boolean,
        default: false
      },
      editedAt: {
        type: Date,
        default: null
      }
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

/*
========================
INDEXES
========================
*/

/*
Chat message pagination (MOST IMPORTANT)
*/
messageSchema.index({
  chatId: 1,
  createdAt: -1
});

/*
Sender history
*/
messageSchema.index({
  senderId: 1,
  createdAt: -1
});

/*
Reply lookup
*/
messageSchema.index({
  replyTo: 1
});

/*
Delivery tracking
*/
messageSchema.index({
  "delivery.userId": 1
});

/*
Media lookup optimization
*/
messageSchema.index({
  mediaAssets: 1
});

/*
Message type filtering (media/text separation)
*/
messageSchema.index({
  chatId: 1,
  type: 1,
  createdAt: -1
});

/*
========================
VALIDATION
========================
*/
messageSchema.pre("validate", function (next) {
  const mediaTypes = [
    MESSAGE_CATEGORIES.IMAGE,
    MESSAGE_CATEGORIES.VIDEO,
    MESSAGE_CATEGORIES.AUDIO,
    MESSAGE_CATEGORIES.FILE
  ];

  if (
    (this.type === MESSAGE_CATEGORIES.TEXT ||
      this.type === MESSAGE_CATEGORIES.SYSTEM) &&
    (!this.content || this.content.trim().length === 0)
  ) {
    return next(new Error(`${this.type} messages must contain content`));
  }

  if (
    mediaTypes.includes(this.type) &&
    (!this.mediaAssets || this.mediaAssets.length === 0)
  ) {
    return next(new Error(`${this.type} messages must contain mediaAssets`));
  }

  next();
});

/*
========================
VIRTUALS
========================
*/
messageSchema.virtual("readCount").get(function () {
  return this.delivery.filter(d => d.readAt).length;
});

messageSchema.virtual("deliveredCount").get(function () {
  return this.delivery.filter(d => d.deliveredAt).length;
});

export const Message = model(MODELS.MESSAGE, messageSchema);