import Joi from "joi";
import { mongoIdSchema } from "../../../validationSchemas/mongodb.schemas.js";

/* =========================
   PARAMS: CHAT ID
========================= */
export const paramsChatIdSchema = Joi.object({
  chatId: mongoIdSchema.required().label("chatId")
});

/* =========================
   PARAMS: MESSAGE ID
========================= */
export const paramsMessageIdSchema = Joi.object({
  messageId: mongoIdSchema.required().label("messageId")
});

/* =========================
   SEND MESSAGE
========================= */
export const sendMessageSchema = Joi.object({
  chatId: mongoIdSchema.required().label("chatId"),

  chatModel: Joi.string()
    .valid("DirectChat", "GroupChat")
    .required()
    .label("chatModel"),

  type: Joi.string()
    .valid("text", "image", "video", "audio", "file", "system")
    .default("text")
    .label("type"),

  text: Joi.string()
    .allow("")
    .max(5000)
    .optional()
    .label("text"),

  media: Joi.array()
    .items(mongoIdSchema)
    .default([])
    .label("media"),

  replyTo: mongoIdSchema
    .allow(null)
    .optional()
    .label("replyTo")
}).custom((value, helpers) => {
  const mediaTypes = ["image", "video", "audio", "file"];

  // enforce rule: text OR media depending on type
  if (value.type === "text" || value.type === "system") {
    if (!value.text || value.text.trim().length === 0) {
      return helpers.error("any.invalid", {
        message: "Text messages must have content"
      });
    }
  }

  if (mediaTypes.includes(value.type)) {
    if (!value.media || value.media.length === 0) {
      return helpers.error("any.invalid", {
        message: `${value.type} messages must include media`
      });
    }
  }

  return value;
});

/* =========================
   GET CHAT MESSAGES (QUERY)
========================= */
export const getMessagesQuerySchema = Joi.object({
  limit: Joi.number().min(1).max(100).default(20),

  page: Joi.number().min(1).default(1),

  before: mongoIdSchema.optional(),

  after: mongoIdSchema.optional()
});

/* =========================
   EDIT MESSAGE
========================= */
export const editMessageSchema = Joi.object({
  text: Joi.string()
    .min(1)
    .max(5000)
    .required()
});

/* =========================
   MARK CHAT AS READ (bulk)
========================= */
export const markChatReadSchema = Joi.object({
  messageId: mongoIdSchema.optional().label("messageId") // for read-up-to optional use
});

/* =========================
   MARK CHAT AS DELIVERED (optional payload future-proofing)
========================= */
export const markChatDeliveredSchema = Joi.object({
  force: Joi.boolean().default(false)
});