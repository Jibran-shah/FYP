import { Router } from "express";
import * as withdrawController from "./withdrawRequests.controller.js";

import {
  createWithdrawRequestSchema,
  getWithdrawRequestsQuerySchema,
  paramsWithdrawRequestIdSchema,
  adminUpdateWithdrawRequestSchema
} from "./withdrawRequests.validation.js";
import { protect, restrictTo } from "../../../middlewares/protect.middleware.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { validate } from "../../../middlewares/validate.middleware.js";

const router = Router();

/* =========================
   CREATE WITHDRAW REQUEST (USER)
========================= */
router.post(
  "/",
  protect(),
  validate(createWithdrawRequestSchema, "body"),
  asyncHandler(withdrawController.createWithdrawRequest)
);

/* =========================
   GET MY WITHDRAW REQUESTS
========================= */
router.get(
  "/my",
  protect(),
  validate(getWithdrawRequestsQuerySchema, "query"),
  asyncHandler(withdrawController.getMyWithdrawRequests)
);

/* =========================
   GET SINGLE REQUEST
========================= */
router.get(
  "/:withdrawRequestId",
  protect(),
  validate(paramsWithdrawRequestIdSchema, "params"),
  asyncHandler(withdrawController.getWithdrawRequestById)
);

/* =========================
   ADMIN: UPDATE STATUS (approve/reject/paid)
========================= */
router.patch(
  "/:withdrawRequestId/status",
  protect(),
  restrictTo("admin"),
  validate(paramsWithdrawRequestIdSchema, "params"),
  validate(adminUpdateWithdrawRequestSchema, "body"),
  asyncHandler(withdrawController.updateWithdrawRequestStatus)
);

export default router;