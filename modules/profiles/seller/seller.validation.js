import Joi from "joi";
import { objectId } from "../../../validationSchemas/mongodb.schemas.js";

export const createProductSellerSchema = Joi.object({
  shopName: Joi.string()
    .trim()
    .min(1)
    .max(100)
    .required(),

  // optional fallback if no file uploaded
  shopLogo: Joi.string().custom(objectId).optional(),

  shopDescription: Joi.string()
    .max(1000)
    .allow("", null)
    .optional(),

  user: Joi.forbidden()
});


export const updateProductSellerSchema = Joi.object({
  shopName: Joi.string().trim().min(1).max(100).optional(),

  // CASE 1: reuse existing MediaAsset
  shopLogo: Joi.string().custom(objectId).optional(),

  // CASE 2: explicitly pass fileId (alternative update method)
  fileId: Joi.string().custom(objectId).optional(),

  shopDescription: Joi.string().max(1000).allow("", null).optional(),

  isApproved: Joi.forbidden(),

  rating: Joi.forbidden(),
  ratingCount: Joi.forbidden(),
  totalProducts: Joi.forbidden()
}).min(1);


export const productSellerIdParamSchema = Joi.object({
  id: Joi.string().custom(objectId).required()
});

export const bulkDeleteProductSellerSchema = Joi.object({
  ids: Joi.array()
    .items(Joi.string().custom(objectId).required())
    .min(1)
    .required()
});

export const getAllProductSellerQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),

  isApproved: Joi.boolean().optional(),

  user: Joi.string().custom(objectId).optional()
});