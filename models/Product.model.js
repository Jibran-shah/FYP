import mongoose from "mongoose";
import {
  PRODUCT_STATUSES,
  PRODUCT_STATUS_ARRAY
} from "../constants/product.constants.js";

const { Schema } = mongoose;

const productSchema = new Schema(
  {

    seller: {
      type: Schema.Types.ObjectId,
      ref: "ProductSeller",
      required: true,
      index: true
    },

    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true
    },

    categoryPath: {
      type: String,
      required: true,
      index: true
    },

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },

    description: {
      type: String,
      trim: true
    },

    price: {
      type: Number,
      required: true,
      min: 0,
      index: true
    },

    quantityAvailable: {
      type: Number,
      default: 0,
      min: 0
    },

    images: [
      {
        type: Schema.Types.ObjectId,
        ref: "MediaAsset"
      }
    ],

    status: {
      type: String,
      enum: PRODUCT_STATUS_ARRAY,
      default: PRODUCT_STATUSES.AVAILABLE,
      index: true
    },

    soldCount: {
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
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
        required: true
      },

      coordinates: {
        type: [Number], // [lng, lat]
        default: undefined,
        validate: {
          validator: function (val) {
            if (!val) return true; // allow optional location

            return (
              Array.isArray(val) &&
              val.length === 2 &&
              val[0] >= -180 &&
              val[0] <= 180 &&
              val[1] >= -90 &&
              val[1] <= 90
            );
          },
          message: "Invalid coordinates [lng, lat]"
        }
      }
    }
  },
  {
    timestamps: true
  }
);

/* =========================================================
   STATUS AUTO-FIX (SAFE)
========================================================= */
productSchema.pre("save", function () {
  if (this.quantityAvailable <= 0) {
    this.status = PRODUCT_STATUSES.SOLD_OUT;
  } else if (
    this.status === PRODUCT_STATUSES.SOLD_OUT &&
    this.quantityAvailable > 0
  ) {
    this.status = PRODUCT_STATUSES.AVAILABLE;
  }
});

/* =========================================================
   INDEXES (FIXED GEO INDEX POSITION)
========================================================= */
productSchema.index({ category: 1, price: 1 });
productSchema.index({ seller: 1, status: 1 });
productSchema.index({ categoryPath: 1 });
productSchema.index({ categoryPath: 1, price: 1 });

/* IMPORTANT: correct 2dsphere index */
productSchema.index({ location: "2dsphere" });

export default (mongoose.models.Product || mongoose.model("Product", productSchema))