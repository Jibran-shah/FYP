import Joi from "joi";
import { SERVICE_STATUS_ARRAY } from "../../constants/service.constants.js";
import { mongoIdSchema } from "../../validationSchemas/mongodb.schemas.js";


export const createServiceSchema = Joi.object({
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

  durationHours: Joi.number()
    .min(0),

  provider: Joi.forbidden(),
  categoryPath: Joi.forbidden(),
  status: Joi.forbidden(),
  bookedCount: Joi.forbidden(),
  ratingSum: Joi.forbidden(),
  ratingCount: Joi.forbidden(),
  ratingAverage: Joi.forbidden()
});

export const updateServiceSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(200),

  description: Joi.string()
    .trim()
    .allow("")
    .max(5000),

  price: Joi.number()
    .min(0),

  durationHours: Joi.number()
    .min(0),

  provider: Joi.forbidden(),
  categoryPath: Joi.forbidden(),
  status: Joi.forbidden(),
  bookedCount: Joi.forbidden(),
  ratingSum: Joi.forbidden(),
  ratingCount: Joi.forbidden(),
  ratingAverage: Joi.forbidden()
}).min(1);

export const serviceQuerySchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10),

  minPrice: Joi.number().min(0),

  maxPrice: Joi.number().min(0),

  category: mongoIdSchema.optional(),

  provider: mongoIdSchema.optional(),

  status: Joi.string()
    .valid(...SERVICE_STATUS_ARRAY),

  categoryPath: Joi.string().trim(),

  /* GEO SEARCH */
  locationLat: Joi.number()
    .min(-90)
    .max(90),

  locationLn: Joi.number()
    .min(-180)
    .max(180),

  radius: Joi.number()
    .min(1)
    .max(500000),

  sort: Joi.string()
    .valid(
      "price",
      "-price",
      "createdAt",
      "-createdAt",
      "ratingAverage",
      "-ratingAverage"
    )
    .default("-createdAt")
}).with("minPrice", "maxPrice");



export const idParamSchema = Joi.object({
  id: mongoIdSchema.required().label("id")
})

export const categoryParamSchema = Joi.object({
  categoryId: mongoIdSchema.required().label("categoryId")
})
