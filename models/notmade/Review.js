import mongoose from "mongoose";

const { Schema } = mongoose;

/**
 * Review Schema
 * Supports reviews for Products OR Services (polymorphic reference)
 */
const reviewSchema = new Schema(
  {
    // User who wrote the review
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Product being reviewed (optional)
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      default: null,
      index: true,
    },

    // Service being reviewed (optional)
    service: {
      type: Schema.Types.ObjectId,
      ref: "Service",
      default: null,
      index: true,
    },

    // Rating value (1 to 5)
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      index: true,
    },

    // Review text
    comment: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
  }
);

reviewSchema.pre("validate", function (next) {
  if (!this.product && !this.service) {
    return next(new Error("Review must belong to a product or a service"));
  }

  if (this.product && this.service) {
    return next(new Error("Review cannot belong to both product and service"));
  }

  next();
});


const Review = mongoose.model("Review", reviewSchema);
export default Review;
