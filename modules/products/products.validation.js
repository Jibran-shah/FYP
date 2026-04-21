import Joi from "joi";
import { PRODUCT_STATUS_ARRAY } from "../../constants/product.constants.js";
import { mongoIdOrNullSchema, mongoIdSchema, requiredMsg } from "../../validationSchemas/general.schemas.js";


export const createProductSchema = Joi.object({
  category: mongoIdSchema.required().messages(requiredMsg("category")),

  name: Joi.string()
    .trim()
    .min(2)
    .max(200)
    .required(),

  description: Joi.string()
    .trim()
    .allow("")
    .max(5000),

  price: Joi.number()
    .min(0)
    .required(),

  quantityAvailable: Joi.number()
    .min(0)
    .default(0),

  images: Joi.array()
    .items(mongoIdSchema.optional())
    .default([]),

  seller: Joi.forbidden(),
  ratingSum: Joi.forbidden(),
  ratingCount: Joi.forbidden(),
  ratingAverage: Joi.forbidden(),
  status: Joi.forbidden(),
  categoryPath: Joi.forbidden()
});


export const updateProductSchema = Joi.object({
  name: Joi.string().trim().min(2).max(200),
  description: Joi.string().trim().allow("").max(5000),
  price: Joi.number().min(0),
  quantityAvailable: Joi.number().min(0),
  status: Joi.string().valid(...PRODUCT_STATUS_ARRAY),
  images: Joi.array().items(mongoIdSchema.optional()),

  seller: Joi.forbidden(),
  ratingSum: Joi.forbidden(),
  ratingCount: Joi.forbidden(),
  ratingAverage: Joi.forbidden(),
  status: Joi.forbidden(),
  categoryPath: Joi.forbidden()
}).min(1)


export const productQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),

  limit: Joi.number().integer().min(1).max(100).default(10),

  minPrice: Joi.number().min(0),

  maxPrice: Joi.number().min(0),

  category: mongoIdSchema.optional(),

  seller: mongoIdSchema.optional(),

  status: Joi.string().valid(...PRODUCT_STATUS_ARRAY),

  categoryPath: Joi.string().trim(),

  sort: Joi.string().valid(
      "price",
      "-price",
      "createdAt",
      "-createdAt",
      "ratingAverage",
      "-ratingAverage"
  ).default("-createdAt")
}).with("minPrice", "maxPrice");


export const idParamSchema = Joi.object({
  id: mongoIdSchema.required().messages(requiredMsg("mongoIdSchema"))
});


export const categoryParamSchema = Joi.object({
  categoryId: mongoIdSchema.required().messages(requiredMsg("categoryId"))
});