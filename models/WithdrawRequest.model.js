import mongoose from "mongoose";

import { MODELS } from "../constants/models.constants.js";

import {
  WITHDRAW_REQUEST_STATUS,
  WITHDRAW_REQUEST_STATUS_ARRAY
} from "../constants/wallet.constants.js";

const { Schema, model, Types } = mongoose;

const withdrawRequestSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: MODELS.USER,
      required: true,
      index: true
    },

    wallet: {
      type: Types.ObjectId,
      ref: MODELS.WALLET,
      required: true,
      index: true
    },

    amount: {
      type: Number,
      required: true,
      min: 1
    },

    status: {
      type: String,
      enum: WITHDRAW_REQUEST_STATUS_ARRAY,
      default: WITHDRAW_REQUEST_STATUS.PENDING,
      index: true
    },

    proofMediaId: {
      type: Types.ObjectId,
      ref: MODELS.MEDIA_ASSET,
      default: null
    },

    adminNote: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

export const WithdrawRequest = model(
  MODELS.WITHDRAW_REQUEST,
  withdrawRequestSchema
);