import { mongoIdSchema } from "../../../validationSchemas/general.schemas";

export const createDirectChatSchema = Joi.object({
  userId1: mongoIdSchema.required().message(requiredMsg("userId1")),
  userId2: mongoIdSchema.required().message(requiredMsg("userId2"))
});


export const paramsChatIdSchema = Joi.object({
  chatId: mongoIdSchema.required().message(requiredMsg("chatId"))
});

export const paramsUserIdSchema = Joi.object({
  userId: mongoIdSchema.required().message(requiredMsg("userId"))
});


export const bodyUserIdSchema = Joi.object({
  userId: mongoIdSchema.required().message(requiredMsg("userId"))
});

export const bodyBlockerIdSchema = Joi.object({
  blockerId: mongoIdSchema.required().message(requiredMsg("blockerId"))
});