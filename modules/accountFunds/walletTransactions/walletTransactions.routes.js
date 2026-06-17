import { Router } from "express";

import * as walletTransactionController from "./walletTransactions.controller.js";

import {
  getWalletTransactionsQuerySchema,
  paramsWalletTransactionIdSchema,
  createWalletTransactionSchema,
} from "./walletTransactions.validation.js";

import { protect, restrictTo } from "../../../middlewares/protect.middleware.js";
import { validate } from "../../../middlewares/validate.middleware.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";

const router = Router();

/* =========================
   GET MY WALLET TRANSACTIONS
========================= */
router.get(
  "/",
  protect(),
  validate(getWalletTransactionsQuerySchema, "query"),
  asyncHandler(walletTransactionController.getMyWalletTransactions)
);

/* =========================
   GET SINGLE TRANSACTION
========================= */
router.get(
  "/:transactionId",
  protect(),
  validate(paramsWalletTransactionIdSchema, "params"),
  asyncHandler(walletTransactionController.getWalletTransactionById)
);

router.post(
  "/admin/manual",
  protect(),
  restrictTo("admin"),
  validate(createWalletTransactionSchema, "body"),
  asyncHandler(walletTransactionController.createManualTransaction)
);

export default router;