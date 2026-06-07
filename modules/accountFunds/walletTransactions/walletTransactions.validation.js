import Joi from "joi";
import { mongoIdSchema } from "../../../validationSchemas/mongodb.schemas.js";

/* =========================
   TRANSACTION TYPES (CLEAN LEDGER MODEL)
========================= */
export const WALLET_TX_TYPES = [
  "order_earning",
  "booking_earning",
  "withdraw_request",
  "withdraw_approved",
  "refund",
  "adjustment"
];

/* =========================
   STATUS FLOW
========================= */
export const WALLET_TX_STATUSES = [
  "pending",
  "approved",
  "rejected",
  "completed"
];

/* =========================
   PARAMS
========================= */
export const paramsWalletTransactionIdSchema = Joi.object({
  transactionId: mongoIdSchema.required()
});

/* =========================
   LIST TRANSACTIONS
========================= */
export const getWalletTransactionsQuerySchema = Joi.object({
  type: Joi.string().valid(...WALLET_TX_TYPES).optional(),

  status: Joi.string().valid(...WALLET_TX_STATUSES).optional(),

  page: Joi.number().min(1).default(1),

  limit: Joi.number().min(1).max(100).default(10)
});

/* =========================
   ADMIN / INTERNAL TX CREATE
========================= */
export const createWalletTransactionSchema = Joi.object({
  amount: Joi.number().positive().required(),

  type: Joi.string().valid(...WALLET_TX_TYPES).required(),

  referenceModel: Joi.string().valid("BuyerOrder", "Booking").optional(),

  referenceId: mongoIdSchema.optional(),

  meta: Joi.object().unknown(true).optional()
});
