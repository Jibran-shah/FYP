import mongoose from "mongoose";

import { SERVICE_STATUSES,SERVICE_STATUS_ARRAY } from "../constants/service.constants.js";

const { Schema } = mongoose;

const serviceSchema = new Schema(
  {

    provider: {
      type: Schema.Types.ObjectId,
      ref: "ServiceProvider",
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

    durationHours: {
      type: Number,
      min: 0
    },

    status: {
      type: String,
      enum: SERVICE_STATUS_ARRAY,
      default: SERVICE_STATUSES.AVAILABLE,
      index: true
    },

    bookedCount: {
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

serviceSchema.index({ provider: 1, status: 1 });
serviceSchema.index({ category: 1, price: 1 });
serviceSchema.index({ categoryPath: 1 });
serviceSchema.index({ categoryPath: 1, price: 1 });

const Service = mongoose.model("Service", serviceSchema);

export default Service;