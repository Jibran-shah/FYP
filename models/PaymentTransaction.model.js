import mongoose from "mongoose";
import {
  PAYABLE_TYPE,
  PAYMENT_STATUS,
  PAYMENT_STATUS_ARRAY,
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
    },

    payableType: {
      type: String,
      enum: Object.values(PAYABLE_TYPE),
      required: true,
    },

    payableId: {
      type: Types.ObjectId,
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    provider: {
      type: String,
      default: "safepay",
    },

    transactionId: {
      type: String,
      unique: true,
      sparse: true,
    },

    status: {
      type: String,
      enum: PAYMENT_STATUS_ARRAY,
      default: PAYMENT_STATUS.PENDING,
    },

    gatewayData: {
      trackerToken: String,

      checkoutURL: String,

      environment: String,

      state: String,

      customerToken: String,

      paymentMethod: {
        token: String,
        cardType: String,
        lastFour: String,
      },

      response: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
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

paymentTransactionSchema.index({ "gatewayData.trackerToken": 1 });

export const PaymentTransaction = model(
  "PaymentTransaction",
  paymentTransactionSchema
);