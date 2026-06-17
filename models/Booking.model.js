import mongoose from "mongoose";
import { MODELS } from "../constants/models.constants.js";
import {
  BOOKING_STATUS,
  BOOKING_STATUS_ARRAY,
} from "../constants/booking.constants.js";

const { Schema, Types, model } = mongoose;

/* =========================
   BOOKING SCHEMA
========================= */
const bookingSchema = new Schema(
  {
    buyer: {
      type: Types.ObjectId,
      ref: MODELS.USER,
      required: true,
    },

    serviceProvider: {
      type: Types.ObjectId,
      ref: MODELS.SERVICE_PROVIDER,
      required: true,
    },

    serviceName: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      default: "",
    },

    scheduledAt: {
      type: Date,
      required: true,
    },

    durationMinutes: {
      type: Number,
      default: 60,
    },

    price: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: BOOKING_STATUS_ARRAY,
      default: BOOKING_STATUS.PENDING,
    },

    notes: {
      type: String,
      default: "",
    },

    paymentTransaction: {
      type: Types.ObjectId,
      ref: MODELS.PAYMENT_TRANSACTION,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

/* =========================
   INDEXES
========================= */

bookingSchema.index({ buyer: 1 });
bookingSchema.index({ serviceProvider: 1 });
bookingSchema.index({ scheduledAt: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ paymentTransaction: 1 });

export const Booking =
  mongoose.models[MODELS.BOOKING] ||
  model(MODELS.BOOKING, bookingSchema);