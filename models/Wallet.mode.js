import mongoose from "mongoose";
import { MODELS } from "../constants/models.constants.js";
import { BadRequestError } from "../errors/Http.error.js";

const { Schema, model, Types } = mongoose;

const walletSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: MODELS.USER,
      required: true,
      unique: true,
      index: true
    },
    

    availableBalance: {
      type: Number,
      default: 0,
      min: 0
    },

    pendingBalance: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

/* =========================
   ADD FUNDS (FINAL CREDIT ONLY)
========================= */
walletSchema.methods.addFunds = function (amount) {
  if (amount <= 0) {
    throw new BadRequestError("Invalid amount");
  }

  this.availableBalance += amount;
  return this.save();
};

/* =========================
   RESERVE FUNDS (ESCROW LOCK)
   available → pending
========================= */
walletSchema.methods.reserveFunds = function (amount) {
  if (amount <= 0) {
    throw new BadRequestError("Invalid amount");
  }

  if (this.availableBalance < amount) {
    throw new BadRequestError("Insufficient available balance");
  }

  this.availableBalance -= amount;
  this.pendingBalance += amount;

  return this.save();
};

/* =========================
   RELEASE RESERVED FUNDS (ESCROW FINALIZATION)
   pending → available
========================= */
walletSchema.methods.releaseReservedFunds = function (amount) {
  if (amount <= 0) {
    throw new BadRequestError("Invalid amount");
  }

  if (this.pendingBalance < amount) {
    throw new BadRequestError("Insufficient pending balance");
  }

  this.pendingBalance -= amount;
  this.availableBalance += amount;

  return this.save();
};

/* =========================
   COMPLETE RESERVED FUNDS (FINAL CONSUMPTION)
   pending → removed (withdrawal or payout completed)
========================= */
walletSchema.methods.completeReservedFunds = function (amount) {
  if (amount <= 0) {
    throw new BadRequestError("Invalid amount");
  }

  if (this.pendingBalance < amount) {
    throw new BadRequestError("Insufficient pending balance");
  }

  this.pendingBalance -= amount;

  return this.save();
};

export const Wallet = model(MODELS.WALLET, walletSchema);