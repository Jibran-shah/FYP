import mongoose from "mongoose";

export const isValidId = (id) =>
  mongoose.Types.ObjectId.isValid(id);

export const objectId = (value, helpers) => {
  if (!isValidId(value)) {
    return helpers?.error("any.invalid");
  }
  return value;
};
