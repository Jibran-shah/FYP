import mongoose from "mongoose";

const { Schema, Types } = mongoose;

export const orderItemSchema = new Schema(
  {
    product: {
      type: Types.ObjectId,
      ref: "Product",
      required: true
    },

    seller: {
      type: Types.ObjectId,
      ref: "ProductSeller",
      required: true   // 🔥 CRITICAL FIX
    },

    quantity: {
      type: Number,
      required: true,
      min: 1
    },

    price: {
      type: Number,
      required: true,
      min: 0
    }
  },
  { _id: false }
);