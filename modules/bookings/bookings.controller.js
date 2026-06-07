import * as bookingsService from "./bookings.service.js";

/* =========================
   CREATE BOOKING
   (creates booking + payment transaction)
========================= */
export const createBooking = async (req, res) => {
  const result = await bookingsService.createBooking({
    buyerId: req.user.id,
    ...req.validated.body
  });

  res.status(201).json({
    success: true,
    message: "Booking created successfully",
    data: result
  });
};

/* =========================
   GET MY BOOKINGS
========================= */
export const getMyBookings = async (req, res) => {
  const result = await bookingsService.getMyBookings({
    buyerId: req.user.id,
    ...req.validated.query
  });

  res.status(200).json({
    success: true,
    message: "Bookings fetched successfully",
    data: result
  });
};

/* =========================
   GET BOOKING BY ID
========================= */
export const getBookingById = async (req, res) => {
  const result = await bookingsService.getBookingById({
    bookingId: req.validated.params.bookingId,
    buyerId: req.user.id
  });

  res.status(200).json({
    success: true,
    message: "Booking fetched successfully",
    data: result
  });
};

/* =========================
   UPDATE BOOKING STATUS
========================= */
export const updateBookingStatus = async (req, res) => {
  const result = await bookingsService.updateBookingStatus({
    bookingId: req.validated.params.bookingId,
    buyerId: req.user.id,
    status: req.validated.body.status
  });

  res.status(200).json({
    success: true,
    message: "Booking status updated successfully",
    data: result
  });
};

/* =========================
   CANCEL BOOKING
========================= */
export const cancelBooking = async (req, res) => {
  const result = await bookingsService.cancelBooking({
    bookingId: req.validated.params.bookingId,
    buyerId: req.user.id
  });

  res.status(200).json({
    success: true,
    message: "Booking cancelled successfully",
    data: result
  });
};

/* =========================
   DELETE BOOKING
========================= */
export const deleteBooking = async (req, res) => {
  const result = await bookingsService.deleteBooking({
    bookingId: req.validated.params.bookingId,
    buyerId: req.user.id
  });

  res.status(200).json({
    success: true,
    message: "Booking deleted successfully",
    data: result
  });
};