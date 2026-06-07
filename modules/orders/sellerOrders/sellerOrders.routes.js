import { Router } from "express";

import * as sellerOrdersController from "./sellerOrders.controller.js";

import {
  paramsSellerOrderIdSchema,
  updateSellerOrderStatusSchema,
  getSellerOrdersQuerySchema
} from "./sellerOrders.validation.js";

import { protect } from "../../../middlewares/protect.middleware.js";
import { validate } from "../../../middlewares/validate.middleware.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";

const router = Router();

/* =========================
   GET MY SELLER ORDERS
========================= */
router.get(
  "/my",
  protect(),
  validate(getSellerOrdersQuerySchema, "query"),
  asyncHandler(sellerOrdersController.getMySellerOrders)
);

/* =========================
   GET SELLER ORDER BY ID
========================= */
router.get(
  "/:sellerOrderId",
  protect(),
  validate(paramsSellerOrderIdSchema, "params"),
  asyncHandler(sellerOrdersController.getSellerOrderById)
);

/* =========================
   UPDATE ORDER STATUS (SOURCE OF TRUTH)
========================= */
router.patch(
  "/:sellerOrderId/status",
  protect(),
  validate(paramsSellerOrderIdSchema, "params"),
  validate(updateSellerOrderStatusSchema, "body"),
  asyncHandler(sellerOrdersController.updateSellerOrderStatus)
);

/* =========================
   LIFECYCLE SHORTCUTS (WRAPPERS ONLY)
   MUST MAP TO STATUS FLOW IN SERVICE
========================= */

router.patch(
  "/:sellerOrderId/process",
  protect(),
  validate(paramsSellerOrderIdSchema, "params"),
  asyncHandler(sellerOrdersController.markAsProcessing)
);

router.patch(
  "/:sellerOrderId/ship",
  protect(),
  validate(paramsSellerOrderIdSchema, "params"),
  asyncHandler(sellerOrdersController.markAsShipped)
);

router.patch(
  "/:sellerOrderId/deliver",
  protect(),
  validate(paramsSellerOrderIdSchema, "params"),
  asyncHandler(sellerOrdersController.markAsDelivered)
);

/* =========================
   CANCEL ORDER
========================= */
router.patch(
  "/:sellerOrderId/cancel",
  protect(),
  validate(paramsSellerOrderIdSchema, "params"),
  asyncHandler(sellerOrdersController.cancelSellerOrder)
);

export default router;