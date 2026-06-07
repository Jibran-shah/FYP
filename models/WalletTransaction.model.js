import mongoose from "mongoose";

import { MODELS } from "../constants/models.constants.js";

import {
  WALLET_TRANSACTION_TYPE_ARRAY,
  WALLET_TRANSACTION_STATUS,
  WALLET_TRANSACTION_STATUS_ARRAY
} from "../constants/wallet.constants.js";

const { Schema, model, Types } = mongoose;

const walletTransactionSchema = new Schema(
  {
    wallet: {
      type: Types.ObjectId,
      ref: MODELS.WALLET,
      required: true,
      index: true
    },

    userId: {
      type: Types.ObjectId,
      ref: MODELS.USER,
      required: true,
      index: true
    },

    type: {
      type: String,
      enum: WALLET_TRANSACTION_TYPE_ARRAY,
      required: true,
      index: true
    },

    amount: {
      type: Number,
      required: true,
      min: 0
    },

    referenceModel: {
      type: String,
      default: null
    },

    referenceId: {
      type: Types.ObjectId,
      default: null,
      index: true
    },

    status: {
      type: String,
      enum: WALLET_TRANSACTION_STATUS_ARRAY,
      default: WALLET_TRANSACTION_STATUS.PENDING,
      index: true
    },

    proofMediaId: {
      type: Types.ObjectId,
      ref: MODELS.MEDIA_ASSET,
      default: null
    },

    metadata: {
      type: Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

export const WalletTransaction = model(
  MODELS.WALLET_TRANSACTION,
  walletTransactionSchema
);