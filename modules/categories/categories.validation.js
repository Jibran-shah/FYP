import Joi from "joi";
import { mongoIdOrNullSchema, mongoIdSchema } from "../../validationSchemas/general.schemas.js";

/* ======================
   CREATE CATEGORY
====================== */
export const createCategorySchema = Joi.object({
  name: Joi.string().trim().min(2).max(150).required(),
  description: Joi.string().trim().allow("").max(1000),
  parentCategory: mongoIdOrNullSchema.optional()
});

/* ======================
   UPDATE CATEGORY
====================== */
export const updateCategorySchema = Joi.object({
  name: Joi.string().trim().min(2).max(150),
  description: Joi.string().trim().allow("").max(1000),
  parentCategory: mongoIdOrNullSchema.optional()
}).min(1);

/* ======================
   PARAMS
====================== */
export const idParamSchema = Joi.object({
  id: mongoIdSchema.required()
});

/* ======================
   QUERY
====================== */
export const categoryQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  parentCategory: mongoIdOrNullSchema.optional(),
  sort: Joi.string()
    .valid("name", "-name", "createdAt", "-createdAt")
    .default("name")
});


export const categoryTreeQuerySchema = Joi.object({
  parentCategory: mongoIdOrNullSchema.optional(),
});