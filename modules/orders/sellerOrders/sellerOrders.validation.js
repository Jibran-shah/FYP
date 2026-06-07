import Joi from "joi";
import { mongoIdSchema } from "../../../validationSchemas/mongodb.schemas.js";

/* =========================
   SELLER ORDER STATUS
   (must match model + service layer)
========================= */
import { SELLER_ORDER_STATUS_ARRAY } from "../../../constants/order.constants.js";

/* =========================
   PARAMS: SELLER ORDER ID
========================= */
export const paramsSellerOrderIdSchema = Joi.object({
  sellerOrderId: mongoIdSchema.required().label("sellerOrderId")
});

/* =========================
   UPDATE ORDER STATUS
========================= */
export const updateSellerOrderStatusSchema = Joi.object({
  status: Joi.string()
    .valid(...SELLER_ORDER_STATUS_ARRAY)
    .required()
    .label("status")
    .messages({
      "any.only": "Invalid seller order status",
      "any.required": "Status is required"
    })
});

/* =========================
   QUERY: GET MY SELLER ORDERS
========================= */
export const getSellerOrdersQuerySchema = Joi.object({
  status: Joi.string()
    .valid(...SELLER_ORDER_STATUS_ARRAY)
    .optional()
    .label("status"),

  page: Joi.number().min(1).optional().label("page"),

  limit: Joi.number().min(1).max(50).optional().label("limit")
});