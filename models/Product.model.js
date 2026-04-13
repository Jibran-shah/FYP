import mongoose from "mongoose";

const { Schema } = mongoose;

const productSchema = new Schema(
  {
    /* ======================
       RELATIONSHIPS
    ====================== */
    seller: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    // Ref to GENERAL category model (materialized path)
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
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

    /* ======================
       PRICE (store smallest unit like paisa)
    ====================== */
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

    /* ======================
       IMAGES
    ====================== */
    images: [
      {
        type: String,
        trim: true
      }
    ],

    /* ======================
       STATUS
    ====================== */
    status: {
      type: String,
      enum: ["available", "sold_out", "inactive"],
      default: "available",
      index: true
    },

    isDeleted: {
      type: Boolean,
      default: false,
      index: true
    },

    /* ======================
       MARKETPLACE DATA
    ====================== */
    soldCount: {
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
   AUTO STATUS BASED ON STOCK
====================== */
productSchema.pre("save", function (next) {
  if (this.quantityAvailable === 0) {
    this.status = "sold_out";
  } else if (this.status === "sold_out") {
    this.status = "available";
  }
  next();
});

/* ======================
   SOFT DELETE FILTER
====================== */
productSchema.pre(/^find/, function (next) {
  this.where({ isDeleted: false });
  next();
});

/* ======================
   INDEXES (only important ones)
====================== */
productSchema.index({ category: 1, price: 1 });
productSchema.index({ seller: 1, status: 1 });

const Product = mongoose.model("Product", productSchema);

export default Product;