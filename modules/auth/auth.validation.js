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


export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.base": "Email must be a string",
    "string.empty": "Email is required",
    "string.email": "Email must be valid",
    "any.required": "Email is required",
  }),
});


export const verifyResetOtpSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.base": "Email must be a string",
    "string.empty": "Email is required",
    "string.email": "Email must be valid",
    "any.required": "Email is required",
  }),

  otp: Joi.string()
    .length(6)
    .pattern(/^[0-9]+$/)
    .required()
    .messages({
      "string.base": "OTP must be a string",
      "string.length": "OTP must be 6 digits",
      "string.pattern.base": "OTP must contain only numbers",
      "any.required": "OTP is required",
    }),
});

export const resetPasswordSchema = Joi.object({
  newPassword: Joi.string()
    .min(6)
    .max(128)
    .required()
    .messages({
      "string.base": "Password must be a string",
      "string.min": "Password must be at least 6 characters",
      "string.max": "Password must be less than 128 characters",
      "any.required": "New password is required",
    }),
});


export const resendResetOtpSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.base": "Email must be a string",
    "string.email": "Email must be valid",
    "any.required": "Email is required",
  }),
});


export const verifyEmailSchema = Joi.object({
  userId: Joi.string()
    .required()
    .messages({
      "any.required": "User ID is required",
    }),

  token: Joi.string()
    .required()
    .messages({
      "any.required": "Verification token is required",
    }),
});



export const resendVerifyEmailSchema = Joi.object({
  userId: Joi.string()
    .required()
    .messages({
      "any.required": "User ID is required",
    }),
});