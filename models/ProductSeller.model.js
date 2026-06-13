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
      ref: "MediaAsset"
    },

    shopDescription: {
      type: String,
      maxlength: 1000
    },

    /* =========================
       LOCATION (UNIFIED FORMAT)
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

      fullAddress: {
        type: String,
        trim: true,
        default: ""
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

/* =========================
   INDEXES (IMPORTANT FIX)
========================= */

/* correct geospatial index */
productSellerSchema.index({
  "location.coordinates": "2dsphere"
});

const ProductSeller = mongoose.model.ProductSeller || mongoose.model("ProductSeller", productSellerSchema);

export default ProductSeller;