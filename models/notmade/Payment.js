import mongoose from "mongoose";

const { Schema } = mongoose;

/**
 * Payment Schema
 * Tracks all payments made on the platform
 */
const paymentSchema = new Schema(
  {
    // User who made the payment
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Amount paid
    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    // Payment method used
    paymentMethod: {
      type: String,
      enum: ["credit_card", "paypal", "bank_transfer", "wallet"],
      required: true,
      index: true,
    },

    // Payment status
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
      index: true,
    },

    // When payment was completed / attempted
    paymentDate: {
      type: Date,
      default: Date.now,
      index: true,
    },

    // Soft delete (optional but recommended)
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  }
);


paymentSchema.pre(/^find/, function (next) {
  this.where({ isDeleted: false });
  next();
});

export default mongoose.model("Payment", paymentSchema);
