const emailVerificationTokenSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    tokenHash: {
      type: String,
      required: true
    },

    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }
    },

    usedAt: {
      type: Date,
      default: null
    },

    attempts: {
      type: Number,
      default: 0
    },

    maxAttempts: {
      type: Number,
      default: 5
    }
  },
  { timestamps: true }
);
