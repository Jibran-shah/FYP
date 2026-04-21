import mongoose from "mongoose";
import { PRODUCT_STATUSES,PRODUCT_STATUS_ARRAY } from "../constants/product.constants.js";

const { Schema } = mongoose;

const productSchema = new Schema(
  {

    seller: {
      type: Schema.Types.ObjectId,
      ref: "User",
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
      required: true
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
    }
  },
  {
    timestamps: true
  }
);

productSchema.pre("save", function () {
  if (this.quantityAvailable === 0) {
    this.status = PRODUCT_STATUSES.SOLD_OUT;
  } else if (this.status === PRODUCT_STATUSES.SOLD_OUT) {
    this.status = PRODUCT_STATUSES.AVAILABLE;
  }
});

/* ======================
   INDEXES
====================== */
productSchema.index({ category: 1, price: 1 });
productSchema.index({ seller: 1, status: 1 });
productSchema.index({ categoryPath: 1 });
productSchema.index({ categoryPath: 1, price: 1 });

const Product = mongoose.model("Product", productSchema);

export default Product;