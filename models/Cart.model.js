import mongoose from "mongoose";
import { cartItemSchema } from "./CartItem.model.js";

const { Schema, Types, model } = mongoose;

/* =========================
   CART
========================= */
const cartSchema = new Schema(
  {
    user: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    items: {
      type: [cartItemSchema],
      default: [],
    },

    subtotal: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

/* =========================
   INDEXES
========================= */
cartSchema.index({ user: 1 });

/* =========================
   AUTO CALCULATION
========================= */
cartSchema.pre("save", function () {
  if (!this.items?.length) {
    this.subtotal = 0;
    return;
  }

  this.items.forEach((item) => {
    item.total = item.price * item.quantity;
  });

  this.subtotal = this.items.reduce((sum, item) => sum + item.total, 0);
});

export const Cart =
  mongoose.models.Cart || model("Cart", cartSchema);