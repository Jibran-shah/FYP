import mongoose from "mongoose";

const { Schema } = mongoose;



import mongoose from "mongoose";
import { REVIEW_ENTITYS_ARRAY } from "../../constants/review.constants";

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    // 🔥 polymorphic reference
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "entityType"
    },

    entityType: {
      type: String,
      required: true,
      enum: REVIEW_ENTITYS_ARRAY
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },

    comment: {
      type: String,
      trim: true
    }
  },
  { timestamps: true }
);


reviewSchema.index(
  { user: 1, entityId: 1, entityType: 1 },
  { unique: true }
);

const Review = mongoose.model("Review", reviewSchema);
export default Review;
