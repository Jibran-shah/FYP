import mongoose from "mongoose";
import { isValidCoordinates } from "../utils/location.utils.js";

const { Schema } = mongoose;

const serviceProviderSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    skills: {
      type: [String],
      set: (arr = []) =>
        [...new Set(arr.map(s => s.trim().toLowerCase()))],
      default: [],
    },

    experienceYears: {
      type: Number,
      default: 0,
      min: 0,
    },

    /* =========================
       LOCATION
    ========================= */
    location: {
      coordinates: {
        type: [Number], // [lng, lat]

        validate: {
          validator(value) {
            if (!value || value.length === 0) return true;

            return (
              Array.isArray(value) &&
              value.length === 2 &&
              isValidCoordinates(value[0], value[1])
            );
          },
          message:
            "Coordinates must be [longitude, latitude] with valid ranges.",
        },
      },

      fullAddress: {
        type: String,
        trim: true
      },
    },

    isApproved: {
      type: Boolean,
      default: false,
      index: true,
    },

    ratingSum: {
      type: Number,
      default: 0,
      min: 0,
    },

    ratingCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    ratingAverage: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

/* =========================
   INDEXES
========================= */

serviceProviderSchema.index({ experienceYears: 1 });
serviceProviderSchema.index({ ratingAverage: -1 });
serviceProviderSchema.index({ ratingCount: -1 });

/*
  Geo index on coordinates only.
  Address-only documents are valid.
*/
serviceProviderSchema.index({
  "location.coordinates": "2dsphere",
});


export const ServiceProvider = mongoose.model.ServiceProvider || mongoose.model(
  "ServiceProvider",
  serviceProviderSchema
);