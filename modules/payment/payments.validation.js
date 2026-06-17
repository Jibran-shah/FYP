import Joi from "joi";
import { mongoIdSchema } from "../../validationSchemas/mongodb.schemas.js";

/* =========================
   CREATE PAYMENT TRANSACTION
========================= */
export const createPaymentTransactionSchema = Joi.object({
  amount: Joi.number()
    .positive()
    .required()
    .label("amount"),

  payableType: Joi.string()
    .valid("order", "booking")
    .required()
    .label("payableType"),

  payableId: mongoIdSchema.required().label("payableId"),

  provider: Joi.string()
    .optional()
    .allow("")
    .label("provider")
});

/* =========================
   PARAMS: TRANSACTION ID
========================= */
export const paramsTransactionIdSchema = Joi.object({
  transactionId: mongoIdSchema.required().label("transactionId")
});

export const confirmSchema = Joi.object({
  trackerId: Joi.string()
    .trim()
    .required()
    .pattern(/^track_[a-zA-Z0-9-]+$/)
    .messages({
      "string.base": "trackerId must be a string",
      "string.empty": "trackerId is required",
      "any.required": "trackerId is required",
      "string.pattern.base": "trackerId format is invalid",
    }),
});

/* =========================
   QUERY: MY TRANSACTIONS
========================= */
export const getTransactionsQuerySchema = Joi.object({
  status: Joi.string()
    .valid("pending", "success", "failed", "refunded")
    .optional()
    .label("status"),

  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .label("page"),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(50)
    .default(10)
    .label("limit")
});

/* =========================
   WEBHOOK VALIDATION (SAFE VERSION)
========================= */
export const paymentWebhookSchema = Joi.object({
  gatewayTransactionId: Joi.string()
    .required()
    .label("gatewayTransactionId"),

  status: Joi.string()
    .valid("success", "failed", "refunded")
    .required()
    .label("status"),

  // amount: Joi.number()
  //   .positive()
  //   .optional()
  //   .label("amount"),

  // paidAt: Joi.date()
  //   .optional()
  //   .label("paidAt"),

  // metadata: Joi.object()
  //   .unknown(true)
  //   .optional()
  //   .label("metadata"),

  // // 🔥 IMPORTANT ADDITION
  // signature: Joi.string()
  //   .required()
  //   .label("signature")
});