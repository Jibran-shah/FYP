import { Router } from "express";

import * as paymentTransactionsController from "./payments.controller.js";

import {
  createPaymentTransactionSchema,
  paramsTransactionIdSchema,
  getTransactionsQuerySchema,
  paymentWebhookSchema,
  confirmSchema
} from "./payments.validation.js";

import { protect, restrictTo } from "../../middlewares/protect.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { verifyWebhook } from "../../utils/payment.utils.js";

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



router.post(
  "/webhooks/safepay",
  asyncHandler(paymentTransactionsController.safepayWebhook)
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

router.post(
  "/confirm",
  protect(),
  validate(confirmSchema),
  asyncHandler(paymentTransactionsController.confirmPayment)
)

/* =========================
   REFUND (ADMIN ONLY - KEEP IF NEEDED)
========================= */
router.patch(
  "/:transactionId/refund",
  protect(),
  restrictTo("admin"),
  validate(paramsTransactionIdSchema, "params"),
  asyncHandler(paymentTransactionsController.refundPayment)
);

export default router;