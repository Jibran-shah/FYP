import { BadRequestError } from "../errors/index.js";


export const parseMongoDuplicateError = (error) => {

  if (!error || error.code !== 11000) return null;

  const field = Object.keys(error.keyPattern || {})[0];
  const value = error.keyValue?.[field];
  const message = `${field} must be unique`;
  return {
    field,
    value,
    message
  };
};