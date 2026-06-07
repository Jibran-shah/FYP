import Joi from "joi";
import { mongoIdSchema } from "../../../validationSchemas/mongodb.schemas.js";
import { BOOKING_STATUS_ARRAY } from "../../constants/booking.constants.js";

/* =========================
   PARAMS: BOOKING ID
========================= */
export const paramsBookingIdSchema = Joi.object({
  bookingId: mongoIdSchema.required().label("bookingId")
});

/* =========================
   CREATE BOOKING
========================= */
export const createBookingSchema = Joi.object({
  serviceProvider: mongoIdSchema.required().label("serviceProvider"),

  serviceName: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .label("serviceName"),

  description: Joi.string()
    .allow("")
    .max(1000)
    .optional()
    .label("description"),

  scheduledAt: Joi.date()
    .iso()
    .min("now") // 🔥 prevents past bookings
    .required()
    .label("scheduledAt"),

  durationMinutes: Joi.number()
    .integer()
    .min(15)
    .max(24 * 60)
    .default(60)
    .label("durationMinutes"),

  price: Joi.number()
    .positive() // 🔥 better than min(0)
    .required()
    .label("price"),

  notes: Joi.string()
    .allow("")
    .max(1000)
    .optional()
    .label("notes")
});

/* =========================
   UPDATE BOOKING STATUS
========================= */
export const updateBookingStatusSchema = Joi.object({
  status: Joi.string()
    .valid(...BOOKING_STATUS_ARRAY)
    .required()
    .label("status")
});

/* =========================
   GET BOOKINGS (QUERY)
========================= */
export const getBookingsQuerySchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .label("page"),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10)
    .label("limit"),

  status: Joi.string()
    .valid(...BOOKING_STATUS_ARRAY)
    .optional()
    .label("status"),

  serviceProvider: mongoIdSchema.optional().label("serviceProvider")
});