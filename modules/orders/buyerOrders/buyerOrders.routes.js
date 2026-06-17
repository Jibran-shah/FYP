import { Router } from "express";

import * as buyerOrdersController from "./buyerOrders.controller.js";

import {
  paramsBuyerOrderIdSchema,
  getBuyerOrdersQuerySchema,
  updateBuyerOrderStatusSchema
} from "./buyerOrders.validation.js";

import { validate } from "../../../middlewares/validate.middleware.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { protect, restrictTo } from "../../../middlewares/protect.middleware.js";

const router = Router();

/* =========================
   GET MY BUYER ORDERS
========================= */
router.get(
  "/my",
  protect(),
  validate(getBuyerOrdersQuerySchema, "query"),
  asyncHandler(buyerOrdersController.getMyBuyerOrders)
);

/* =========================
   GET SINGLE BUYER ORDER
========================= */
router.get(
  "/:buyerOrderId",
  protect(),
  validate(paramsBuyerOrderIdSchema, "params"),
  asyncHandler(buyerOrdersController.getBuyerOrderById)
);

/* =========================
   UPDATE ORDER STATUS
   (internal/admin/system only recommended)
========================= */
router.patch(
  "/:buyerOrderId/status",
  protect(),
  restrictTo("admin"),
  validate(paramsBuyerOrderIdSchema, "params"),
  validate(updateBuyerOrderStatusSchema, "body"),
  asyncHandler(buyerOrdersController.updateBuyerOrderStatus)
);

/* =========================
   CANCEL BUYER ORDER
   (buyer action only)
========================= */
router.patch(
  "/:buyerOrderId/cancel",
  protect(),
  validate(paramsBuyerOrderIdSchema, "params"),
  asyncHandler(buyerOrdersController.cancelBuyerOrder)
);

export default router;