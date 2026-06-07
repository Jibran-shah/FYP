import Joi from "joi";
import { mongoIdSchema } from "../../validationSchemas/mongodb.schemas.js";

/* =========================
   WALLET TRANSACTION TYPES
   (ledger events only)
========================= */
const WALLET_TRANSACTION_TYPES = [
  "order_earning",
  "booking_earning",
  "withdraw_request",
  "withdraw_approved",
  "withdraw_rejected",
  "refund",
  "adjustment"
];

/* =========================
   WALLET TRANSACTION STATUSES
========================= */
const WALLET_TRANSACTION_STATUSES = [
  "pending",
  "approved",
  "rejected",
  "completed"
];

/* =========================
   PARAMS: TRANSACTION ID
========================= */
export const paramsWalletTransactionIdSchema = Joi.object({
  transactionId: mongoIdSchema.required().label("transactionId")
});

/* =========================
   QUERY: WALLET TRANSACTIONS
========================= */
export const getWalletTransactionsQuerySchema = Joi.object({
  type: Joi.string()
    .valid(...WALLET_TRANSACTION_TYPES)
    .optional()
    .label("type"),

  status: Joi.string()
    .valid(...WALLET_TRANSACTION_STATUSES)
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
    .max(100)
    .default(10)
    .label("limit")
});