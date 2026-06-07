import mongoose from "mongoose";

import { SELLER_ORDER_STATUS, SELLER_ORDER_STATUS_ARRAY } from "../constants/order.constants.js";
import { orderItemSchema } from "./OrderItem.Model.js";

const { Schema, Types, model } = mongoose;

const sellerOrderSchema = new Schema(
  {
    buyerOrder: {
      type: Types.ObjectId,
      ref: "BuyerOrder",
      required: true,
      index: true
    },

    seller: {
      type: Types.ObjectId,
      ref: "ProductSeller",
      required: true,
      index: true
    },

    buyer: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    /* 🔥 IMPORTANT: link to payment transaction */
    paymentTransaction: {
      type: Types.ObjectId,
      ref: "PaymentTransaction",
      required: true,
      index: true
    },

    items: [orderItemSchema],

    totalAmount: {
      type: Number,
      required: true
    },

    status: {
      type: String,
      enum: SELLER_ORDER_STATUS_ARRAY,
      default: SELLER_ORDER_STATUS.PENDING,
      index: true
    }
  },
  {
    timestamps: true
  }
);

/* useful compound indexes */
sellerOrderSchema.index({ seller: 1, createdAt: -1 });
sellerOrderSchema.index({ buyerOrder: 1, seller: 1 });

export const SellerOrder = model("SellerOrder", sellerOrderSchema);