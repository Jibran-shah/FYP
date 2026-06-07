import { Router } from "express";

import * as cartController from "./cart.controller.js";

import {
  addToCartSchema,
  updateCartItemSchema,
  removeCartItemSchema,
  clearCartSchema
} from "./cart.validation.js";

import { protect } from "../../../middlewares/protect.middleware.js";
import { validate } from "../../../middlewares/validate.middleware.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";

const router = Router();

/* =========================
   GET CART
========================= */
router.get(
  "/",
  protect(),
  asyncHandler(cartController.getCart)
);

/* =========================
   ADD ITEM TO CART
========================= */
router.post(
  "/add",
  protect(),
  validate(addToCartSchema, "body"),
  asyncHandler(cartController.addToCart)
);

/* =========================
   UPDATE ITEM QUANTITY
========================= */
router.patch(
  "/item",
  protect(),
  validate(updateCartItemSchema, "body"),
  asyncHandler(cartController.updateCartItem)
);

/* =========================
   REMOVE ITEM FROM CART
========================= */
router.delete(
  "/item/:productId",
  protect(),
  validate(removeCartItemSchema, "params"),
  asyncHandler(cartController.removeCartItem)
);

/* =========================
   CLEAR CART
========================= */
router.delete(
  "/clear",
  protect(),
  asyncHandler(cartController.clearCart)
);

export default router;