import mongoose from "mongoose";
import {
  PAYMENT_STATUS,
  PAYMENT_STATUS_ARRAY
} from "../constants/payment.constants.js";

const { Schema, Types, model } = mongoose;

/* =========================
   PAYMENT TRANSACTION
========================= */
const paymentTransactionSchema = new Schema(
  {
    buyer: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    payableType: {
      type: String,
      enum: ["order", "booking"],
      required: true,
      index: true
    },

    payableId: {
      type: Types.ObjectId,
      required: true,
      index: true
    },

    amount: {
      type: Number,
      required: true
    },

    transactionId: {
      type: String,
      index: true,
      unique: true,
      sparse: true
    },

    status: {
      type: String,
      enum: PAYMENT_STATUS_ARRAY,
      default: PAYMENT_STATUS.PENDING,
      index: true
    }
  },
  {
    timestamps: true
  }
);

/* =========================
   INDEXES
========================= */
paymentTransactionSchema.index({ buyer: 1, createdAt: -1 });

paymentTransactionSchema.index(
  { payableType: 1, payableId: 1 },
  { unique: true }
);

export const PaymentTransaction = model(
  "PaymentTransaction",
  paymentTransactionSchema
);