const mediaAttachmentSchema = new Schema(
  {
    mediaAsset: {
      type: Types.ObjectId,
      ref: MODELS.MEDIA_ASSET,
      required: true,
      index: true
    },

    resourceType: {
      type: String,
      required: true,
      index: true,
      enum: [
        "CHAT_MESSAGE",
        "USER_PROFILE",
        "GROUP",
        "POST",
        "COMMENT"
      ]
    },

    resourceId: {
      type: Types.ObjectId,
      required: true,
      index: true
    },

    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    versionKey: false
  }
);


