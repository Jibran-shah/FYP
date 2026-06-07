import mongoose from "mongoose";
import { Booking, BOOKING_STATUS } from "./booking.model.js";
import { PaymentTransaction } from "../payments/paymentTransaction.model.js";

import {
  NotFoundError,
  BadRequestError,
  ForbiddenError
} from "../../../errors/Http.error.js";
import { MODELS } from "../../constants/models.constants.js";

/* =========================
   CREATE BOOKING
   + CREATE PAYMENT TRANSACTION
========================= */
export const createBooking = async ({
  buyerId,
  serviceProvider,
  serviceName,
  description,
  scheduledAt,
  durationMinutes,
  price,
  notes
}) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const bookingTime = new Date(scheduledAt);

    if (bookingTime < new Date()) {
      throw new BadRequestError("Cannot book in the past");
    }

    const conflict = await Booking.findOne({
      serviceProvider,
      scheduledAt: bookingTime,
      status: {
        $in: [BOOKING_STATUS.PENDING, BOOKING_STATUS.CONFIRMED]
      }
    }).session(session);

    if (conflict) {
      throw new BadRequestError("Time slot already booked");
    }

    const bookingArr = await Booking.create(
      [
        {
          buyer: buyerId,
          serviceProvider,
          serviceName,
          description,
          scheduledAt: bookingTime,
          durationMinutes,
          price,
          notes,
          status: BOOKING_STATUS.PENDING
        }
      ],
      { session }
    );

    const booking = bookingArr[0];

    const paymentArr = await PaymentTransaction.create(
      [
        {
          buyer: buyerId,
          payableType: "booking",
          payableId: booking._id,
          amount: price,
          status: "pending"
        }
      ],
      { session }
    );

    const payment = paymentArr[0];

    booking.paymentTransaction = payment._id;
    await booking.save({ session });

    await session.commitTransaction();

    return { booking, payment };
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

/* =========================
   GET MY BOOKINGS
========================= */
export const getMyBookings = async ({
  userId,
  page = 1,
  limit = 10,
  status,
  serviceProvider
}) => {
  const query = {
    $or: [{ buyer: userId }, { serviceProvider: userId }]
  };

  if (status) query.status = status;
  if (serviceProvider) query.serviceProvider = serviceProvider;

  return Booking.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .populate("buyer", "name email")
    .populate("serviceProvider", "shopName")
    .populate("paymentTransaction");
};

/* =========================
   GET SINGLE BOOKING
========================= */
export const getBookingById = async ({ bookingId, userId }) => {
  const booking = await Booking.findById(bookingId)
    .populate("buyer")
    .populate("serviceProvider")
    .populate("paymentTransaction");

  if (!booking) {
    throw new NotFoundError("Booking not found");
  }

  const isOwner =
    booking.buyer.toString() === userId.toString() ||
    booking.serviceProvider.toString() === userId.toString();

  if (!isOwner) {
    throw new ForbiddenError("Access denied");
  }

  return booking;
};

/* =========================
   UPDATE BOOKING STATUS
========================= */
export const updateBookingStatus = async ({
  bookingId,
  userId,
  status
}) => {
  const booking = await Booking.findById(bookingId);

  if (!booking) {
    throw new NotFoundError("Booking not found");
  }

  const isProvider =
    booking.serviceProvider.toString() === userId.toString();

  if (!isProvider) {
    throw new ForbiddenError("Only provider can update status");
  }

  const validTransitions = {
    pending: ["confirmed", "cancelled"],
    confirmed: ["completed", "cancelled"]
  };

  if (!validTransitions[booking.status]?.includes(status)) {
    throw new BadRequestError(
      `Invalid status transition from ${booking.status} to ${status}`
    );
  }

  if(status === "completed"){
    await releaseWalletEarning({
      userId: booking.serviceProvider,
      amount: booking.price,
      referenceId: booking._id,
      referenceModel: MODELS.BOOKING
    });
  }

  booking.status = status;
  await booking.save();

  return booking;
};

/* =========================
   CANCEL BOOKING
========================= */
export const cancelBooking = async ({ bookingId, userId }) => {
  const booking = await Booking.findById(bookingId);

  if (!booking) {
    throw new NotFoundError("Booking not found");
  }

  const isOwner =
    booking.buyer.toString() === userId.toString() ||
    booking.serviceProvider.toString() === userId.toString();

  if (!isOwner) {
    throw new ForbiddenError("Not allowed");
  }

  if (booking.status === BOOKING_STATUS.COMPLETED) {
    throw new BadRequestError("Cannot cancel completed booking");
  }

  booking.status = BOOKING_STATUS.CANCELLED;
  await booking.save();

  return booking;
};

/* =========================
   DELETE BOOKING
========================= */
export const deleteBooking = async ({ bookingId, userId }) => {
  const booking = await Booking.findById(bookingId);

  if (!booking) {
    throw new NotFoundError("Booking not found");
  }

  if (booking.buyer.toString() !== userId.toString()) {
    throw new ForbiddenError("Only buyer can delete booking");
  }

  await booking.deleteOne();

  return true;
};