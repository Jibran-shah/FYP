import { objectId } from "../../../validationSchemas/mongodb.schemas.js";
import Joi from "joi";

export const createProfileSchema = Joi.object({
  fullName: Joi.string().trim().min(1).max(80).required(),

  phone: Joi.string()
    .trim()
    .pattern(/^\+?[1-9]\d{7,14}$/)
    .optional(),

  bio: Joi.string().max(500).optional(),
  country: Joi.string().trim().optional(),
  city: Joi.string().trim().optional(),
  address: Joi.string().trim().optional(),

  role: Joi.forbidden(),
  user: Joi.forbidden()
});


export const updateProfileSchema = Joi.object({
  fullName: Joi.string().trim().min(1).max(80).optional(),

  fileId: Joi.string().custom(objectId).optional(),

  phone: Joi.string()
    .trim()
    .pattern(/^\+?[1-9]\d{7,14}$/)
    .optional(),

  bio: Joi.string().max(500).optional(),
  country: Joi.string().trim().optional(),
  city: Joi.string().trim().optional(),
  address: Joi.string().trim().optional(),

  role: Joi.forbidden(),
  user: Joi.forbidden()
})
  .or("fileId", "fullName", "phone", "bio", "country", "city", "address")
  .messages({
    "object.missing": "At least one field must be provided"
  });


export const getProfilesQuerySchema = Joi.object({
  fullName: Joi.string().trim().min(1).max(80).optional(),
  country: Joi.string().trim().optional(),
  city: Joi.string().trim().optional(),
  address: Joi.string().trim().optional(),
  roles: Joi.alternatives().try(
    Joi.array().items(
      Joi.string().valid("productSeller", "serviceProvider", "buyer")
    ),
    Joi.string() // allow ?roles=provider
  ).optional(),

  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional()
});



export const profileIdSchema = Joi.object({
  id: Joi.string().custom(objectId).required()
});