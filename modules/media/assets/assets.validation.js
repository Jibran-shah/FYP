import Joi from "joi";
import { objectId } from "../../../validationSchemas/mongodb.schemas.js";
import { MEDIA_USAGE_TYPES } from "../../../constants/media.constants.js";



// ------------------------
// CREATE MediaAsset
// ------------------------
export const createMediaAssetSchema = Joi.object({
  title: Joi.string().min(1).max(255).optional(),

  slug: Joi.string()
    .pattern(/^[a-z0-9-_]+$/)
    .optional(),
    

  usageType: Joi.string()
  .valid(...MEDIA_USAGE_TYPES)
  .optional(),

  namespace: Joi.string()
  .pattern(/^[a-z0-9-_\/]+$/)
  .min(1)
  .optional(),

  file: Joi.string().custom(objectId).required()
});


export const updateMediaAssetSchema = Joi.object({

  title: Joi.string().min(1).max(255).optional(),

  slug: Joi.string()
    .pattern(/^[a-z0-9-_]+$/)
    .optional(),

  usageType: Joi.string()
  .valid(...MEDIA_USAGE_TYPES)
  .optional(),

  namespace: Joi.string()
  .pattern(/^[a-z0-9-_\/]+$/)
  .min(1)
  .optional()


}).min(1); // at least one field required


export const mediaAssetIdParamSchema = Joi.object({
  id: Joi.string().custom(objectId).required()
});


export const bulkDeleteMediaAssetsSchema = Joi.object({
  mediaAssetIds: Joi.array()
    .items(Joi.string().custom(objectId).required())
    .min(1)
    .required()
});


export const getAllMediaAssetsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
// TODO extract the type enum from all place to a centralized place
  usageType: Joi.string()
  .valid(...MEDIA_USAGE_TYPES)
  .optional()
});