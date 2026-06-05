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

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point"
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        validate: {
          validator: function (value) {
            return (
              Array.isArray(value) &&
              value.length === 2 &&
              value[0] >= -180 &&
              value[0] <= 180 &&
              value[1] >= -90 &&
              value[1] <= 90
            );
          },
          message:
            "Coordinates must be [longitude, latitude] with valid ranges."
        }
      },

      address: {
        country: { type: String, trim: true, default:"" },
        state: { type: String, trim: true, default:"" },
        city: { type: String, trim: true, default:"" },
        area: { type: String, trim: true, default:"" },
        fullAddress: { type: String, trim: true, default:"" }
      }
      
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


productSellerSchema.index({ location: "2dsphere" });


export default mongoose.model("ProductSeller", productSellerSchema);

