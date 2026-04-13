import Joi from "joi";
import mongoose from "mongoose";

export const objectId = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.message("Invalid ObjectId format");
  }
  return value;
};