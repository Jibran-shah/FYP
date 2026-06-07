import Joi from "joi";
import { mongoIdSchema } from "../../../validationSchemas/mongodb.schemas.js";

export const createDirectChatSchema = Joi.object({
  userId: mongoIdSchema.required().label("userId")
});

export const paramsChatIdSchema = Joi.object({
  chatId: mongoIdSchema.required().label("chatId")
});

export const paramsUserIdSchema = Joi.object({
  userId: mongoIdSchema.required().label("userId")
});


export const bodyUserIdSchema = Joi.object({
  userId: mongoIdSchema.required().label("userId")
});

export const bodyBlockerIdSchema = Joi.object({
  blockerId: mongoIdSchema.required().label("blockerId")
});