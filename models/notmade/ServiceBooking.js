import mongoose from "mongoose";

const { Schema } = mongoose;

/**
 * ServiceBooking Schema
 * Represents a booked/purchased service
 */
const serviceBookingSchema = new Schema(
  {
    // Service being booked
    service: {
      type: Schema.Types.ObjectId,
      ref: "Service",
      required: true,
      index: true,
    },

    // Buyer (customer)
    buyer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Seller (service provider)
    seller: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Scheduled date & time for the service
    scheduledAt: {
      type: Date,
      required: true,
      index: true,
    },

    // Booking lifecycle status
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
      index: true,
    },

    // Final agreed price (copied from service at booking time)
    price: {
      type: Number,
      required: true,
      min: 0,
    },

    // Payment reference
    payment: {
      type: Schema.Types.ObjectId,
      ref: "Payment",
      index: true,
    },

    // Soft delete support (optional but recommended)
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);


serviceBookingSchema.pre(/^find/, function (next) {
  this.where({ isDeleted: false });
  next();
});


const ServiceBooking = mongoose.model("ServiceBooking", serviceBookingSchema);
export default ServiceBooking;
