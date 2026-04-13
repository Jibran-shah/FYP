import Joi from "joi";


export const registerSchema = Joi.object({
  userName: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required()
    .messages({
      "string.base": "Username must be a string",
      "string.empty": "Username is required",
      "string.alphanum": "Username can only contain letters and numbers",
      "string.min": "Username must be at least 3 characters",
      "string.max": "Username must be at most 30 characters",
      "any.required": "Username is required",
    }),

  email: Joi.string()
    .email()
    .required()
    .messages({
      "string.base": "Email must be a string",
      "string.empty": "Email is required",
      "string.email": "Email must be a valid email address",
      "any.required": "Email is required",
    }),

  password: Joi.string()
    .min(6)
    .max(128)
    .required()
    .messages({
      "string.base": "Password must be a string",
      "string.empty": "Password is required",
      "string.min": "Password must be at least 6 characters",
      "string.max": "Password must be less than 128 characters",
      "any.required": "Password is required",
    }),
})
.required()
.messages({
  "object.base": "Request body must be an object",
});

export const loginSchema = Joi.object({
  userName: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .messages({
      "string.base": "Username must be a string",
      "string.empty": "Username cannot be empty",
      "string.alphanum": "Username can only contain letters and numbers",
      "string.min": "Username must be at least 3 characters",
      "string.max": "Username must be at most 30 characters",
    }),

  email: Joi.string()
    .email()
    .messages({
      "string.base": "Email must be a string",
      "string.empty": "Email cannot be empty",
      "string.email": "Email must be a valid email address",
    }),

  password: Joi.string()
    .min(6)
    .max(128)
    .required()
    .messages({
      "string.base": "Password must be a string",
      "string.empty": "Password is required",
      "string.min": "Password must be at least 6 characters",
      "string.max": "Password must be less than 128 characters",
      "any.required": "Password is required",
    }),
})
.or("email", "userName")
.messages({
  "object.missing": "Either email or username is required for login",
});