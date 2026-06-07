import Joi from "joi";
import { mongoIdSchema } from "../../../validationSchemas/mongodb.schemas.js";

const WITHDRAW_STATUS = ["pending", "approved", "rejected", "paid"];

/* =========================
   CREATE REQUEST
========================= */
export const createWithdrawRequestSchema = Joi.object({
  amount: Joi.number().positive().required().label("amount"),
  proofMediaId: mongoIdSchema.optional().allow(null).label("proofMediaId")
});

/* =========================
   PARAMS
========================= */
export const paramsWithdrawRequestIdSchema = Joi.object({
  withdrawRequestId: mongoIdSchema.required().label("withdrawRequestId")
});

/* =========================
   QUERY
========================= */
export const getWithdrawRequestsQuerySchema = Joi.object({
  status: Joi.string().valid(...WITHDRAW_STATUS).optional(),
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(50).default(10)
});

/* =========================
   ADMIN UPDATE STATUS
========================= */
export const adminUpdateWithdrawRequestSchema = Joi.object({
  status: Joi.string()
    .valid(...WITHDRAW_STATUS)
    .required()
    .label("status"),

  adminNote: Joi.string().allow("").optional()
});