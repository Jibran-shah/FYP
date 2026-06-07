import mongoose from "mongoose";

const { Schema, Types, model } = mongoose;


/* =========================
   CART ITEM
========================= */
export const cartItemSchema = new Schema(
  {
    product: {
      type: Types.ObjectId,
      ref: "Product",
      required: true
    },

    seller: {
      type: Types.ObjectId,
      ref: "ProductSeller",
      required: true
    },

    price: {
      type: Number,
      required: true
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1
    },

    total: {
      type: Number,
      required: true
    }
  },
  { _id: false }
);