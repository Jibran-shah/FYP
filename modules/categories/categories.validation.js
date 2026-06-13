import Joi from "joi";
import { mongoIdSchema } from "../../validationSchemas/mongodb.schemas.js";
import { mongoIdOrNullSchema } from "../../validationSchemas/general.schemas.js";

import {
  CATEGORY_APPLIES_TO_ARRAY
} from "../../constants/category.constants.js";

/* ======================
   SHARED SCHEMA
====================== */
const appliesToSchema = Joi.array()
  .items(Joi.string().valid(...CATEGORY_APPLIES_TO_ARRAY))
  .min(1)
  .max(CATEGORY_APPLIES_TO_ARRAY.length)
  .required(); // IMPORTANT: enforce at least 1 value

/* ======================
   CREATE CATEGORY
====================== */
export const createCategorySchema = Joi.object({
  name: Joi.string().trim().min(2).max(150).required(),
  description: Joi.string().trim().allow("").max(1000),
  parentCategory: mongoIdOrNullSchema.optional(),

  appliesTo: appliesToSchema
});

/* ======================
   UPDATE CATEGORY
====================== */
export const updateCategorySchema = Joi.object({
  name: Joi.string().trim().min(2).max(150),
  description: Joi.string().trim().allow("").max(1000),
  parentCategory: mongoIdOrNullSchema.optional(),

  appliesTo: appliesToSchema
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

/* ======================
   TREE QUERY
====================== */
export const categoryTreeQuerySchema = Joi.object({
  parentCategory: mongoIdOrNullSchema.optional()
});