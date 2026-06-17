import mongoose from "mongoose";
import { orderItemSchema } from "./OrderItem.Model.js";
import {
  BUYER_ORDER_STATUS,
  BUYER_ORDER_STATUS_ARRAY,
} from "../constants/order.constants.js";

const { Schema, Types, model } = mongoose;

const buyerOrderSchema = new Schema(
  {
    buyer: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Snapshot of purchased items
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (items) => items.length > 0,
        message: "Order must contain at least one item",
      },
    },

    // Seller-specific split orders
    sellerOrders: [
      {
        type: Types.ObjectId,
        ref: "SellerOrder",
      },
    ],

    // One order ↔ one payment transaction
    paymentTransaction: {
      type: Types.ObjectId,
      ref: "PaymentTransaction",
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: BUYER_ORDER_STATUS_ARRAY,
      default: BUYER_ORDER_STATUS.PENDING,
    },

    // Optional: when payment was successfully completed
    paidAt: {
      type: Date,
    },

    // Optional: when order was cancelled
    cancelledAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

/* =========================
   INDEXES
========================= */

// Fast lookup for buyer order history
buyerOrderSchema.index({ buyer: 1, createdAt: -1 });

// Query by status
buyerOrderSchema.index({ status: 1, createdAt: -1 });

// Payment lookup (optional but commonly used)
buyerOrderSchema.index({ paymentTransaction: 1 });

export const BuyerOrder = model("BuyerOrder", buyerOrderSchema);