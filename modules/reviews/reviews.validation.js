import Joi from "joi";
import mongoose from "mongoose";

import {
  REVIEW_ENTITYS_ARRAY
} from "../../constants/review.constants.js";
import { mongoIdSchema } from "../../validationSchemas/general.schemas.js";



/* =========================================================
   CREATE REVIEW
========================================================= */
export const createReviewSchema = Joi.object({
  entityId: mongoIdSchema.required()
    .messages({
      "any.required": "Entity ID is required",
      "any.invalid": "Invalid entity ID"
    }),

  entityType: Joi.string()
    .valid(...REVIEW_ENTITYS_ARRAY)
    .required()
    .messages({
      "any.only": `Entity type must be one of: ${REVIEW_ENTITYS_ARRAY.join(", ")}`,
      "any.required": "Entity type is required"
    }),

  rating: Joi.number()
    .min(1)
    .max(5)
    .required()
    .messages({
      "number.base": "Rating must be a number",
      "number.min": "Rating must be at least 1",
      "number.max": "Rating cannot exceed 5",
      "any.required": "Rating is required"
    }),

  comment: Joi.string()
    .trim()
    .max(2000)
    .allow("")
    .optional()
    .messages({
      "string.max": "Comment cannot exceed 2000 characters"
    })
});


/* =========================================================
   UPDATE REVIEW
========================================================= */
export const updateReviewSchema = Joi.object({
  rating: Joi.number()
    .min(1)
    .max(5)
    .optional()
    .messages({
      "number.base": "Rating must be a number",
      "number.min": "Rating must be at least 1",
      "number.max": "Rating cannot exceed 5"
    }),

  comment: Joi.string()
    .trim()
    .max(2000)
    .allow("")
    .optional()
    .messages({
      "string.max": "Comment cannot exceed 2000 characters"
    })
}).min(1).messages({
  "object.min": "At least one field is required for update"
});


/* =========================================================
   REVIEW ID PARAM
========================================================= */
export const reviewIdParamSchema = Joi.object({
  id: mongoIdSchema.required()
    .messages({
      "any.required": "Review ID is required",
      "any.invalid": "Invalid review ID"
    })
});


/* =========================================================
   ENTITY PARAMS
========================================================= */
export const entityReviewParamsSchema = Joi.object({
  entityType: Joi.string()
    .valid(...REVIEW_ENTITYS_ARRAY)
    .required()
    .messages({
      "any.only": `Entity type must be one of: ${REVIEW_ENTITYS_ARRAY.join(", ")}`,
      "any.required": "Entity type is required"
    }),

  entityId:mongoIdSchema.required()
    .messages({
      "any.required": "Entity ID is required",
      "any.invalid": "Invalid entity ID"
    })
});


/* =========================================================
   QUERY FILTERS
========================================================= */
export const reviewQuerySchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .optional(),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .optional(),

  entityType: Joi.string()
    .valid(...REVIEW_ENTITYS_ARRAY)
    .optional(),

  rating: Joi.number()
    .min(1)
    .max(5)
    .optional(),

  sort: Joi.string()
    .optional()
});