import Joi from "joi";
import { PRODUCT_STATUS_ARRAY } from "../../constants/product.constants.js";
import { mongoIdOrNullSchema } from "../../validationSchemas/general.schemas.js";
import { mongoIdSchema } from "../../validationSchemas/mongodb.schemas.js";


export const createProductSchema = Joi.object({
  category: mongoIdSchema.required().label("category"),

  name: Joi.string()
    .trim()
    .min(2)
    .max(200)
    .required(),

  description: Joi.string()
    .trim()
    .allow("")
    .max(5000),

  price: Joi.number()
    .min(0)
    .required(),

  quantityAvailable: Joi.number()
    .min(0)
    .default(0),

  images: Joi.array()
    .items(mongoIdSchema.optional())
    .default([]),

  seller: Joi.forbidden(),
  ratingSum: Joi.forbidden(),
  ratingCount: Joi.forbidden(),
  ratingAverage: Joi.forbidden(),
  status: Joi.forbidden(),
  categoryPath: Joi.forbidden()
  
});


export const updateProductSchema = Joi.object({
  name: Joi.string().trim().min(2).max(200),
  description: Joi.string().trim().allow("").max(5000),
  price: Joi.number().min(0),
  quantityAvailable: Joi.number().min(0),
  status: Joi.string().valid(...PRODUCT_STATUS_ARRAY),
  images: Joi.array().items(mongoIdSchema.optional()),

  seller: Joi.forbidden(),
  ratingSum: Joi.forbidden(),
  ratingCount: Joi.forbidden(),
  ratingAverage: Joi.forbidden(),
  status: Joi.forbidden(),
  categoryPath: Joi.forbidden()
}).min(1)


export const productQuerySchema = Joi.object({
  /* PAGINATION */
  page: Joi.number()
    .integer()
    .min(1)
    .default(1),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10),

  /* SEARCH */
  search: Joi.string()
    .trim()
    .allow("")
    .max(200)
    .default(""),

  name: Joi.string()
    .trim()
    .allow("")
    .max(200),

  /* PRICE */
  minPrice: Joi.number()
    .min(0)
    .empty("")
    .optional(),

  maxPrice: Joi.number()
    .min(0)
    .empty("")
    .optional(),

  /* REFERENCES */
  category: mongoIdSchema
    .empty("")
    .optional(),

  seller: mongoIdSchema
    .empty("")
    .optional(),

  /* CATEGORY PATH */
  categoryPath: Joi.string()
    .trim()
    .allow("")
    .optional(),

  /* PRODUCT STATUS */
  status: Joi.string()
    .valid(...PRODUCT_STATUS_ARRAY)
    .empty("")
    .optional(),

  /* INVENTORY */
  inStock: Joi.boolean()
    .empty("")
    .optional(),

  minQuantity: Joi.number()
    .integer()
    .min(0)
    .empty("")
    .optional(),

  /* RATINGS */
  minRating: Joi.number()
    .min(0)
    .max(5)
    .empty("")
    .optional(),

  minRatingCount: Joi.number()
    .integer()
    .min(0)
    .empty("")
    .optional(),

  /* DATES */
  createdFrom: Joi.date()
    .empty("")
    .optional(),

  createdTo: Joi.date()
    .empty("")
    .optional(),

  /* SORTING */
  sort: Joi.string()
    .valid(
      "price",
      "-price",
      "createdAt",
      "-createdAt",
      "ratingAverage",
      "-ratingAverage",
      "ratingCount",
      "-ratingCount"
    )
    .empty("")
    .default("-createdAt"),

  /* GEO SEARCH */
  lng: Joi.number()
    .min(-180)
    .max(180)
    .empty("")
    .optional(),

  lat: Joi.number()
    .min(-90)
    .max(90)
    .empty("")
    .optional(),

  radius: Joi.number()
    .min(0)
    .max(50000)
    .empty("")
    .optional(),
})
  .with("lat", "lng")
  .with("lng", "lat");


export const idParamSchema = Joi.object({
  id: mongoIdSchema.required().label("id")
});


export const categoryParamSchema = Joi.object({
  categoryId: mongoIdSchema.required().label("category")
});