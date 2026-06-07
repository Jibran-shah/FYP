import Joi from "joi";
import { mongoIdSchema } from "../../../validationSchemas/mongodb.schemas.js";
import { BUYER_ORDER_STATUS_ARRAY } from "../../../constants/order.constants.js";

/* =========================
   ORDER STATUS (SINGLE SOURCE STYLE)
========================= */

/* =========================
   PARAMS: BUYER ORDER ID
========================= */
export const paramsBuyerOrderIdSchema = Joi.object({
  buyerOrderId: mongoIdSchema.required().label("buyerOrderId")
});

/* =========================
   QUERY: GET MY BUYER ORDERS
========================= */
export const getBuyerOrdersQuerySchema = Joi.object({
  status: Joi.string()
    .valid(...BUYER_ORDER_STATUS_ARRAY)
    .optional()
    .label("status"),

  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .label("page"),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(50)
    .default(10)
    .label("limit")
});

/* =========================
   UPDATE ORDER STATUS
========================= */
export const updateBuyerOrderStatusSchema = Joi.object({
  status: Joi.string()
    .valid(...BUYER_ORDER_STATUS_ARRAY)
    .required()
    .label("status")
    .messages({
      "any.only": "Invalid buyer order status",
      "any.required": "Status is required"
    })
});