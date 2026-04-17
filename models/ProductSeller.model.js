// models/ProductSeller.js

import mongoose from "mongoose";

const productSellerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },

    shopName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },

    shopLogo: {
      type: mongoose.Schema.Types.ObjectId,
      ref:"MediaAsset"
    },

    shopDescription: {
      type: String,
      maxlength: 1000
    },

    isApproved: {
      type: Boolean,
      default: false
    },

    totalProducts: {
      type: Number,
      default: 0
    },

    ratingSum: {
      type: Number,
      default: 0,
      min: 0
    },

    ratingCount: {
      type: Number,
      default: 0,
      min: 0
    },

    ratingAverage: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
      index: true
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model("ProductSeller", productSellerSchema);