import Joi from "joi";
import mongoose from "mongoose";

export const isValidId = (id) =>
  mongoose.Types.ObjectId.isValid(id);

const objectId = (value, helpers) => {
  if (!isValidId(value)) {
    return helpers.error("any.invalid");
  }
  return value;
};

export const mongoIdSchema = Joi.string()
  .custom(objectId, "ObjectId validation")
  .messages({
    "string.base": "{#label} must be a string",
    "string.empty": "{#label} cannot be empty",
    "any.invalid": "{#label} must be a valid MongoDB ObjectId"
  });