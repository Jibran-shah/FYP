import { Router } from "express";

import * as messageController from "./messages.controller.js";

import {
  sendMessageSchema,
  getMessagesQuerySchema,
  paramsChatIdSchema,
  paramsMessageIdSchema,
  editMessageSchema,
  markChatReadSchema
} from "./messages.validation.js";


import { protect } from "../../../middlewares/protect.middleware.js";
import { validate } from "../../../middlewares/validate.middleware.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";

const router = Router();

/* =========================
   GET CHAT MESSAGES (HISTORY)
========================= */
router.get(
  "/chat/:chatId",
  protect(),
  validate(paramsChatIdSchema, "params"),
  validate(getMessagesQuerySchema, "query"),
  asyncHandler(messageController.getChatMessages)
);

/* =========================
   SEND MESSAGE
========================= */
router.post(
  "/",
  protect(),
  validate(sendMessageSchema, "body"),
  asyncHandler(messageController.sendMessage)
);

/* =========================
   EDIT MESSAGE
========================= */
router.patch(
  "/:messageId",
  protect(),
  validate(paramsMessageIdSchema, "params"),
  validate(editMessageSchema, "body"),
  asyncHandler(messageController.editMessage)
);

/* =========================
   DELETE MESSAGE (SOFT)
========================= */
router.delete(
  "/:messageId",
  protect(),
  validate(paramsMessageIdSchema, "params"),
  asyncHandler(messageController.deleteMessage)
);

/* =========================
   MARK SINGLE MESSAGE AS READ
========================= */
router.patch(
  "/:messageId/read",
  protect(),
  validate(paramsMessageIdSchema, "params"),
  asyncHandler(messageController.markMessageAsRead)
);

/* =========================
   MARK SINGLE MESSAGE AS DELIVERED
========================= */
router.patch(
  "/:messageId/delivered",
  protect(),
  validate(paramsMessageIdSchema, "params"),
  asyncHandler(messageController.markMessageAsDelivered)
);

/* =========================
   BULK: MARK CHAT AS READ
========================= */
router.patch(
  "/chat/:chatId/read",
  protect(),
  validate(paramsChatIdSchema, "params"),
  validate(markChatReadSchema, "body"),
  asyncHandler(messageController.markChatAsRead)
);

/* =========================
   BULK: MARK CHAT AS DELIVERED
========================= */
router.patch(
  "/chat/:chatId/delivered",
  protect(),
  validate(paramsChatIdSchema, "params"),
  asyncHandler(messageController.markChatAsDelivered)
);

/* =========================
   MARK CHAT AS READ UP TO MESSAGE
   (WhatsApp-style behavior)
========================= */
router.patch(
  "/chat/:chatId/read-up-to/:messageId",
  protect(),
  validate(paramsChatIdSchema, "params"),
  validate(paramsMessageIdSchema, "params"),
  asyncHandler(messageController.markChatAsReadUpTo)
);

export default router;