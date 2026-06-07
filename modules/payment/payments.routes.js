import { Router } from "express";

import * as paymentTransactionsController from "./payments.controller.js";

import {
  createPaymentTransactionSchema,
  paramsTransactionIdSchema,
  getTransactionsQuerySchema,
  paymentWebhookSchema
} from "./payments.validation.js";

import { protect } from "../../middlewares/protect.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

const router = Router();

/* =========================
   CREATE PAYMENT TRANSACTION
========================= */
router.post(
  "/",
  protect(),
  validate(createPaymentTransactionSchema, "body"),
  asyncHandler(paymentTransactionsController.createPaymentTransaction)
);

/* =========================
   GET MY TRANSACTIONS
========================= */
router.get(
  "/my",
  protect(),
  validate(getTransactionsQuerySchema, "query"),
  asyncHandler(paymentTransactionsController.getMyPaymentTransactions)
);

/* =========================
   GET TRANSACTION BY ID
========================= */
router.get(
  "/:transactionId",
  protect(),
  validate(paramsTransactionIdSchema, "params"),
  asyncHandler(paymentTransactionsController.getPaymentTransactionById)
);

/* =========================
   WEBHOOK (PAYMENT GATEWAY ONLY)
   MUST BE PROTECTED VIA SIGNATURE IN CONTROLLER
========================= */
router.post(
  "/webhook",
  validate(paymentWebhookSchema),
  asyncHandler(paymentTransactionsController.handlePaymentWebhook)
);

/* =========================
   REFUND (ADMIN ONLY - KEEP IF NEEDED)
========================= */
router.patch(
  "/:transactionId/refund",
  protect(),
  validate(paramsTransactionIdSchema, "params"),
  asyncHandler(paymentTransactionsController.refundPayment)
);

export default router;