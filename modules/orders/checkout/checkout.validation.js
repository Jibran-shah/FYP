import Joi from "joi";

/* =========================
   CHECKOUT
========================= */
export const createCheckoutSchema = Joi.object({
  paymentMethod: Joi.string()
    .valid("cod", "card", "wallet", "bank")
    .required()
    .label("paymentMethod"),

  // IMPORTANT (ESCROW SAFETY)
  // prevents duplicate payment/order creation on retry
  idempotencyKey: Joi.string()
    .optional()
    .label("idempotencyKey")
});