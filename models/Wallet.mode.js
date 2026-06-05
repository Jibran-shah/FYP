import mongoose from "mongoose";
import { MODELS } from "../constants/models.constants.js";

const { Schema, model, Types } = mongoose;

/*
=====================================================
WALLET MODEL (SIMPLE)
=====================================================
*/
const walletSchema = new Schema(
  {
    /*
    👤 Owner
    */
    userId: {
      type: Types.ObjectId,
      ref: MODELS.USER,
      required: true,
      unique: true,
      index: true
    },

    /*
    💰 Money available for spending
    */
    availableBalance: {
      type: Number,
      default: 0,
      min: 0,
      index: true
    },

    /*
    ⏳ Money locked (orders, pending payments, disputes)
    */
    pendingBalance: {
      type: Number,
      default: 0,
      min: 0,
      index: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

/*
=====================================================
HELPER METHODS
=====================================================
*/

/*
Add money → available balance
*/
walletSchema.methods.credit = function (amount) {
  this.availableBalance += amount;
  return this.save();
};

/*
Move money from available → pending (lock funds)
*/
walletSchema.methods.freeze = function (amount) {

  if (this.availableBalance < amount) {
    throw new Error("Insufficient balance");
  }

  this.availableBalance -= amount;
  this.pendingBalance += amount;

  return this.save();
};

/*
Confirm pending → available stays reduced (finalize spend)
*/
walletSchema.methods.confirm = function (amount) {

  if (this.pendingBalance < amount) {
    throw new Error("Insufficient pending balance");
  }

  this.pendingBalance -= amount;

  return this.save();
};

/*
Release pending → back to available (refund/cancel)
*/
walletSchema.methods.release = function (amount) {

  if (this.pendingBalance < amount) {
    throw new Error("Insufficient pending balance");
  }

  this.pendingBalance -= amount;
  this.availableBalance += amount;

  return this.save();
};

/*
=====================================================
MODEL
=====================================================
*/
export const Wallet = model(MODELS.WALLET, walletSchema);