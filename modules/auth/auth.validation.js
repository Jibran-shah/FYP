import Joi from "joi";
import { emailSchema, mongoIdSchema, otpSchema, passwordSchema, requiredMsg, userNameSchema } from "../../validationSchemas/general.schemas.js";

export const registerSchema = Joi.object({
  userName: userNameSchema.required().messages(requiredMsg("userName")),

  email: emailSchema.required().messages(requiredMsg("email")),

  password: passwordSchema.required().messages(requiredMsg("password")),
})
.required()
.messages({
  "object.base": "Request body must be an object",
});

export const loginSchema = Joi.object({
  userName: userNameSchema.optional(),

  email:emailSchema.optional(),

  password: passwordSchema.required().messages(requiredMsg("password")),
})
.or("email", "userName")
.messages({
  "object.missing": "Either email or username is required for login",
});


export const forgotPasswordSchema = Joi.object({
  email: emailSchema.required().messages(requiredMsg("email"))
});


export const verifyResetOtpSchema = Joi.object({
  email: emailSchema.required().messages(requiredMsg("email")),

  otp:otpSchema.required().messages(requiredMsg("otp")),
});

export const resetPasswordSchema = Joi.object({
  newPassword: passwordSchema
    .required()
    .messages(requiredMsg("password")),
});


export const resendResetOtpSchema = Joi.object({
  email: emailSchema
    .required()
    .messages(requiredMsg("email")),
});


export const verifyEmailSchema = Joi.object({
  userId: mongoIdSchema
    .required()
    .messages(requiredMsg("userId")),

  token: Joi.string()
    .required()
    .messages({
      "any.required": "Verification token is required",
    }),
});



export const resendVerifyEmailSchema = Joi.object({
  userId: mongoIdSchema
    .required()
    .messages(requiredMsg("userId"))
});