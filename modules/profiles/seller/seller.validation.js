import Joi from "joi";
import { objectId } from "../../../validationSchemas/mongodb.schemas.js";
import { mongoIdSchema, requiredMsg } from "../../../validationSchemas/general.schemas.js";

export const createProductSellerSchema = Joi.object({
  shopName: Joi.string()
    .trim()
    .min(1)
    .max(100)
    .required(),

  shopLogoId: mongoIdSchema.optional(),

  shopLogoFile: Joi.any().optional(), // IMPORTANT: allow file placeholder

  shopDescription: Joi.string()
    .max(1000)
    .allow("", null)
    .optional(),

  locationLn: Joi.number().optional(),
  locationLat: Joi.number().optional(),
  
  user: Joi.forbidden()
});


export const updateProductSellerSchema = Joi.object({
  shopName: Joi.string().trim().min(1).max(100).optional(),

  shopLogoId: mongoIdSchema.optional(),

  shopLogoFile: Joi.any().optional(),

  shopDescription: Joi.string().max(1000).allow("", null).optional(),

  locationLn: Joi.number().optional(),
  locationLat: Joi.number().optional(),

  isApproved: Joi.forbidden(),
  rating: Joi.forbidden(),
  ratingCount: Joi.forbidden(),
  totalProducts: Joi.forbidden()
}).min(1);


export const productSellerIdParamSchema = Joi.object({
  id: mongoIdSchema.required().messages(requiredMsg("id"))
});

export const bulkDeleteProductSellerSchema = Joi.object({
  ids: Joi.array()
    .items(mongoIdSchema.required())
    .min(1)
    .required()
});

export const getAllProductSellerQuerySchema = Joi.object({
  shopName: Joi.string()
    .trim()
    .min(1)
    .max(100)
    .optional(),
  locationLat:Joi.number().optional(),
  locationLn:Joi.number().optional(),
  locationRad:Joi.number().optional(),
  isApproved: Joi.string().trim().optional(),
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  user: Joi.string().custom(objectId).optional()
});