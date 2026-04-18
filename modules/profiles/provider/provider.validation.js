import Joi from "joi";
import { objectId } from "../../../validationSchemas/mongodb.schemas.js";
import { mongoIdSchema } from "../../../validationSchemas/general.schemas.js";


export const createServiceProviderSchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(1)
    .max(120)
    .required(),

  description: Joi.string()
    .max(1000)
    .allow("", null)
    .optional(),

  skills: Joi.array()
    .items(Joi.string().trim().min(1).required())
    .unique()
    .optional(),

  experienceYears: Joi.number()
    .min(0)
    .optional(),
});

export const updateServiceProviderSchema = Joi.object({
  title: Joi.string().trim().min(1).max(120),

  description: Joi.string().max(1000).allow("", null),

  skills: Joi.array()
    .items(Joi.string().trim().min(1).required())
    .unique()
    .optional(),

  experienceYears: Joi.number().min(0),

  isApproved: Joi.boolean().forbidden(), // 🔒 admin only

  ratingSum: Joi.forbidden(),
  ratingCount: Joi.forbidden(),
  ratingAverage: Joi.forbidden(),
}).min(1);



export const getAllServiceProviderQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),

  isApproved: Joi.boolean().optional(),

  user: Joi.string().custom(objectId).optional(),

  skills: Joi.alternatives().try(
    Joi.array()
      .items(Joi.string().trim().min(1).required())
      .unique()
      .optional(),
    Joi.string().pattern(/^[a-zA-Z0-9, ]+$/)
  ),

  minExperience: Joi.number().min(0).optional(),
});



export const serviceProviderIdParamSchema = Joi.object({
  id: mongoIdSchema.required()
});


export const bulkDeleteServiceProviderSchema = Joi.object({
  ids: Joi.array()
    .items(mongoIdSchema.required())
    .min(1)
    .required()
});
