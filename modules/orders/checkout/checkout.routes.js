import { Router } from "express";

import * as checkoutController from "./checkout.controller.js";

import {
  createCheckoutSchema
} from "./checkout.validation.js";

import { protect } from "../../../middlewares/protect.middleware.js";
import { validate } from "../../../middlewares/validate.middleware.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";

const router = Router();

/* =========================
   CHECKOUT
   Cart -> BuyerOrder + PaymentTransaction
========================= */
router.post(
  "/",
  protect(),
  validate(createCheckoutSchema, "body"),
  asyncHandler(checkoutController.checkout)
);

export default router;