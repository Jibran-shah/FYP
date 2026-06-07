import Joi from "joi";
import { mongoIdSchema } from "../../../validationSchemas/mongodb.schemas.js";

/* =========================
   ADD TO CART
========================= */
export const addToCartSchema = Joi.object({
  productId: mongoIdSchema.required().label("productId"),

  quantity: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .label("quantity")
});

/* =========================
   UPDATE CART ITEM
========================= */
export const updateCartItemSchema = Joi.object({
  productId: mongoIdSchema.required().label("productId"),

  quantity: Joi.number()
    .integer()
    .min(1)
    .required()
    .label("quantity")
});

/* =========================
   REMOVE ITEM FROM CART (PARAMS)
========================= */
export const removeCartItemSchema = Joi.object({
  productId: mongoIdSchema.required().label("productId")
});

/* =========================
   CLEAR CART (OPTIONAL SAFETY FLAG)
========================= */
export const clearCartSchema = Joi.object({
  confirm: Joi.boolean()
    .valid(true)
    .required()
    .label("confirm")
});