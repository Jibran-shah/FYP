import mongoose from "mongoose";

const { Schema } = mongoose;

/**
 * Service Schema
 * Represents a service offered by a provider (e.g., freelancing, repair, consulting)
 */
const serviceSchema = new Schema(
  {
    /* ======================
       RELATIONSHIPS
    ====================== */
    seller: {
      type: Schema.Types.ObjectId,
      ref: "ServiceProvider", // points to provider profile, not raw user
      required: true,
      index: true
    },

    category: {
      type: Schema.Types.ObjectId,
      ref: "Category", // general materialized path category
      required: true,
      index: true
    },

    /* ======================
       CORE FIELDS
    ====================== */
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
      min: 0
    },

    durationHours: {
      type: Number,
      min: 0
    },

    /* ======================
       STATUS
    ====================== */
    status: {
      type: String,
      enum: ["available", "inactive", "booked"],
      default: "available",
      index: true
    },

    isDeleted: {
      type: Boolean,
      default: false,
      index: true
    },

    /* ======================
       ANALYTICS
    ====================== */
    bookedCount: {
      type: Number,
      default: 0
    },

    ratingAverage: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },

    ratingCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

/* ======================
   SOFT DELETE FILTER
====================== */
serviceSchema.pre(/^find/, function (next) {
  this.where({ isDeleted: false });
  next();
});

/* ======================
   INDEXES
====================== */
serviceSchema.index({ seller: 1, status: 1 });
serviceSchema.index({ category: 1, price: 1 });

const Service = mongoose.model("Service", serviceSchema);
export default Service;