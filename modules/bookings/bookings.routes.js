import { Router } from "express";

import * as bookingsController from "./bookings.controller.js";

import {
  createBookingSchema,
  paramsBookingIdSchema,
  getBookingsQuerySchema,
  updateBookingStatusSchema
} from "./bookings.validation.js";
import { protect } from "../../middlewares/protect.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";


const router = Router();

/* =========================
   CREATE BOOKING
========================= */
router.post(
  "/",
  protect(),
  validate(createBookingSchema, "body"),
  asyncHandler(bookingsController.createBooking)
);

/* =========================
   GET MY BOOKINGS
========================= */
router.get(
  "/my",
  protect(),
  validate(getBookingsQuerySchema, "query"),
  asyncHandler(bookingsController.getMyBookings)
);

/* =========================
   GET SINGLE BOOKING
========================= */
router.get(
  "/:bookingId",
  protect(),
  validate(paramsBookingIdSchema, "params"),
  asyncHandler(bookingsController.getBookingById)
);

/* =========================
   UPDATE BOOKING STATUS (manual/admin use)
========================= */
router.patch(
  "/:bookingId/status",
  protect(),
  validate(paramsBookingIdSchema, "params"),
  validate(updateBookingStatusSchema, "body"),
  asyncHandler(bookingsController.updateBookingStatus)
);

/* =========================
   CANCEL BOOKING
========================= */
router.patch(
  "/:bookingId/cancel",
  protect(),
  validate(paramsBookingIdSchema, "params"),
  asyncHandler(bookingsController.cancelBooking)
);

/* =========================
   DELETE BOOKING (optional)
========================= */
router.delete(
  "/:bookingId",
  protect(),
  validate(paramsBookingIdSchema, "params"),
  asyncHandler(bookingsController.deleteBooking)
);

export default router;