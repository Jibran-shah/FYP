import Joi from "joi";

/**
 * Allowed entity types must match your Mongoose model names
 */
export const REPORT_ENTITY_TYPES = [
  "User",
  "Product",
  "Post",
  "Comment",
  "Message",
];

/**
 * =========================
 * CREATE REPORT
 * =========================
 */
export const createReportSchema = Joi.object({
  entityId: Joi.string()
    .hex()
    .length(24)
    .required()
    .messages({
      "string.base": "Entity ID must be a string",
      "string.hex": "Entity ID must be a valid ObjectId",
      "string.length": "Entity ID must be 24 characters",
      "any.required": "Entity ID is required",
    }),

  entityType: Joi.string()
    .valid(...REPORT_ENTITY_TYPES)
    .required()
    .messages({
      "any.only": `Entity type must be one of ${REPORT_ENTITY_TYPES.join(
        ", "
      )}`,
      "any.required": "Entity type is required",
    }),

  description: Joi.string()
    .min(5)
    .max(2000)
    .trim()
    .required()
    .messages({
      "string.min": "Description must be at least 5 characters",
      "string.max": "Description cannot exceed 2000 characters",
      "any.required": "Description is required",
    }),
});

/**
 * =========================
 * UPDATE REPORT STATUS
 * =========================
 */
export const updateReportStatusSchema = Joi.object({
  status: Joi.string()
    .valid("PENDING", "REVIEWED", "RESOLVED", "REJECTED")
    .required()
    .messages({
      "any.only":
        "Status must be PENDING, REVIEWED, RESOLVED, or REJECTED",
      "any.required": "Status is required",
    }),
});

/**
 * =========================
 * PARAM VALIDATION
 * =========================
 */
export const reportIdParamSchema = Joi.object({
  reportId: Joi.string()
    .hex()
    .length(24)
    .required()
    .messages({
      "string.hex": "Report ID must be a valid ObjectId",
      "string.length": "Report ID must be 24 characters",
      "any.required": "Report ID is required",
    }),
});