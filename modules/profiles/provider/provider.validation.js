import Joi from "joi";
import { objectId } from "../../../validationSchemas/mongodb.schemas.js";
import { mongoIdSchema } from "../../../validationSchemas/general.schemas.js";


/* =========================================================
   CREATE SERVICE PROVIDER
========================================================= */
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
    .items(Joi.string().trim().min(1))
    .unique()
    .optional(),

  locationLat: Joi.number()
    .min(-90)
    .max(90)
    .optional(),

  locationLn: Joi.number()
    .min(-180)
    .max(180)
    .optional(),

  fullAddress: Joi.string()
    .max(300)
    .allow("", null)
    .optional(),

  experienceYears: Joi.number()
    .min(0)
    .optional()
});


/* =========================================================
   UPDATE SERVICE PROVIDER
========================================================= */
export const updateServiceProviderSchema = Joi.object({
  title: Joi.string().trim().min(1).max(120),

  description: Joi.string().max(1000).allow("", null),

  skills: Joi.array()
    .items(Joi.string().trim().min(1))
    .unique(),

  experienceYears: Joi.number().min(0),

  /* =========================================================
     OPTIONAL LOCATION UPDATE
  ========================================================= */
  locationLat: Joi.number().min(-90).max(90),
  locationLn: Joi.number().min(-180).max(180),

  fullAddress: Joi.string().max(300).allow("", null),

  isApproved: Joi.boolean().forbidden(),

  ratingSum: Joi.forbidden(),
  ratingCount: Joi.forbidden(),
  ratingAverage: Joi.forbidden()
}).min(1);


/* =========================================================
   GET ALL SERVICE PROVIDERS (QUERY)
========================================================= */
export const getAllServiceProviderQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),

  isApproved: Joi.boolean().optional(),

  user: Joi.string().custom(objectId).optional(),

  /* =========================================================
     GEO QUERY (NEARBY SEARCH)
     used with radius (meters)
  ========================================================= */
  locationLat: Joi.number().min(-90).max(90).optional(),
  locationLn: Joi.number().min(-180).max(180).optional(),
  radius: Joi.number().min(1).max(500000).optional(), // meters

  skills: Joi.alternatives().try(
    Joi.array().items(Joi.string().trim().min(1)).unique(),
    Joi.string().pattern(/^[a-zA-Z0-9, ]+$/)
  ),

  minExperience: Joi.number().min(0).optional()
});


/* =========================================================
   PARAM VALIDATION
========================================================= */
export const serviceProviderIdParamSchema = Joi.object({
  id: mongoIdSchema.required()
});


/* =========================================================
   BULK DELETE
========================================================= */
export const bulkDeleteServiceProviderSchema = Joi.object({
  ids: Joi.array()
    .items(mongoIdSchema.required())
    .min(1)
    .required()
});