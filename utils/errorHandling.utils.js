import { BadRequestError } from "../errors/index.js";

export const handleMongoError = (err) => {
  if (err.code === 11000) {
    throw new BadRequestError("Duplicate resource");
  }
  throw err;
};