import mongoose from "mongoose";

const { Schema } = mongoose;

const wishlistSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // one wishlist per user
      index: true
    },

    products: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true
        },
        addedAt: {
          type: Date,
          default: Date.now
        }
      }
    ],

    services: [
      {
        service: {
          type: Schema.Types.ObjectId,
          ref: "Service",
          required: true
        },
        addedAt: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  { timestamps: true } // createdAt, updatedAt
);

// Prevent duplicates in products array
wishlistSchema.pre("save", function (next) {
  if (this.products) {
    const uniqueProducts = [];
    const seen = new Set();
    for (const p of this.products) {
      if (!seen.has(p.product.toString())) {
        seen.add(p.product.toString());
        uniqueProducts.push(p);
      }
    }
    this.products = uniqueProducts;
  }

  if (this.services) {
    const uniqueServices = [];
    const seen = new Set();
    for (const s of this.services) {
      if (!seen.has(s.service.toString())) {
        seen.add(s.service.toString());
        uniqueServices.push(s);
      }
    }
    this.services = uniqueServices;
  }

  next();
});

export default mongoose.model("Wishlist", wishlistSchema);
