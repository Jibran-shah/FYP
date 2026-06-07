import mongoose from "mongoose";
import { orderItemSchema } from "./OrderItem.Model.js";
import { BUYER_ORDER_STATUS, BUYER_ORDER_STATUS_ARRAY } from "../constants/order.constants.js";


const { Schema, Types, model } = mongoose;

const buyerOrderSchema = new Schema(
  {
    buyer: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    items: [orderItemSchema],

    sellerOrders: [
      {
        type: Types.ObjectId,
        ref: "SellerOrder"
      }
    ],

    paymentTransaction: {
      type: Types.ObjectId,
      ref: "PaymentTransaction",
      index: true
    },

    totalAmount: {
      type: Number,
      required: true,
      min:0
    },

    status: {
      type: String,
      enum: BUYER_ORDER_STATUS_ARRAY,
      default: BUYER_ORDER_STATUS.PENDING
    }
  },
  {
    timestamps: true
  }
);

export const BuyerOrder = model(
  "BuyerOrder",
  buyerOrderSchema
);