import Joi from "joi";
import { objectId } from "./mongodb.schemas.js";

export const emailSchema = Joi.string()
  .email({ tlds: { allow: false } })
  .trim()
  .lowercase()
  .messages({
    "string.base": "Email must be a string",
    "string.empty": "Email cannot be empty",
    "string.email": "Enter a valid email address"
  });

export const phoneSchema = Joi.string()
  .pattern(/^\+?[0-9]{10,15}$/)
  .messages({
    "string.base": "Phone must be a string",
    "string.empty": "Phone number cannot be empty",
    "string.pattern.base":
      "Phone must be 10–15 digits and may start with +"
  });

export const userNameSchema = Joi.string()
  .pattern(/^[a-zA-Z0-9._]+$/)
  .min(3)
  .max(30)
  .messages({
    "string.base": "Username must be a string",
    "string.empty": "Username cannot be empty",
    "string.pattern.base":
      "Username can only contain letters, numbers, dots, and underscores",
    "string.min": "Username must be at least 3 characters",
    "string.max": "Username must not exceed 30 characters"
  });

export const passwordSchema = Joi.string()
  .min(8)
  .max(64)
  .pattern(/[a-z]/)
  .pattern(/[A-Z]/)
  .pattern(/[0-9]/)
  .pattern(/[@$!%*?&]/)
  .messages({
    "string.base": "Password must be a string",
    "string.empty": "Password cannot be empty",
    "string.min": "Password must be at least 8 characters",
    "string.max": "Password must not exceed 64 characters",
    "string.pattern.base":
      "Password must include uppercase, lowercase, number, and special character (@$!%*?&)"
  });


export const requiredMsg = (field) => ({
  "any.required": `${field} is required`
});

export const otpSchema =  Joi.string()
    .length(6)
    .pattern(/^[0-9]+$/)
    .messages({
      "string.base": "OTP must be a string",
      "string.length": "OTP must be 6 digits",
      "string.pattern.base": "OTP must contain only numbers",
    })

export const mongoIdSchema = Joi.string()
    .custom(objectId)

