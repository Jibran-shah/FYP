import {
  NotFoundError,
  ForbiddenError
} from "../../../errors/Http.error.js";

import { DirectChat } from "../../../models/DirectChat.model.js";
import { GroupChat } from "../../../models/GroupChat.model.js";
import { Message } from "../../../models/Message.model.js";

/* =========================
   HELPERS
========================= */
const getChatModel = (chatModel) => {
  return chatModel === "GroupChat" ? GroupChat : DirectChat;
};

const ensureExists = (doc, message = "Not found") => {
  if (!doc) throw new NotFoundError(message);
  return doc;
};

const isSameUser = (a, b) => a.toString() === b.toString();

/* =========================
   SEND MESSAGE
========================= */
export const sendMessage = async ({
  senderId,
  chatId,
  chatModel,
  type = "text",
  text = "",
  media = [],
  replyTo = null
}) => {
  const Chat = getChatModel(chatModel);

  const chat = await Chat.findById(chatId);
  ensureExists(chat, "Chat not found");

  const message = await Message.create({
    senderId,
    chatId,
    chatModel,
    type,
    text,
    media,
    replyTo
  });

  return message;
};

/* =========================
   GET CHAT MESSAGES
========================= */
export const getChatMessages = async ({
  chatId,
  page = 1,
  limit = 20
}) => {
  const skip = (page - 1) * limit;

  return Message.find({ chatId, isDeleted: false })
    .populate("senderId", "name email")
    .populate("media")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));
};

/* =========================
   EDIT MESSAGE
========================= */
export const editMessage = async ({
  messageId,
  userId,
  text
}) => {
  const message = await Message.findById(messageId);
  ensureExists(message, "Message not found");

  if (!isSameUser(message.senderId, userId)) {
    throw new ForbiddenError("Only sender can edit message");
  }

  message.text = text;
  message.isEdited = true;
  message.editedAt = new Date();

  await message.save();
  return message;
};

/* =========================
   DELETE MESSAGE (SOFT)
========================= */
export const deleteMessage = async ({
  messageId,
  userId
}) => {
  const message = await Message.findById(messageId);
  ensureExists(message, "Message not found");

  if (!isSameUser(message.senderId, userId)) {
    throw new ForbiddenError("Only sender can delete message");
  }

  message.isDeleted = true;

  await message.save();
  return true;
};

/* =========================
   MARK SINGLE MESSAGE (READ / DELIVERED)
========================= */
const markSingle = async (messageId, userId, field) => {
  const message = await Message.findById(messageId);
  ensureExists(message, "Message not found");

  const list = message[field];

  const exists = list.some((x) => isSameUser(x.userId, userId));

  if (!exists) {
    list.push({
      userId,
      at: new Date()
    });
  }

  await message.save();
  return message;
};

/* =========================
   MARK MESSAGE READ
========================= */
export const markMessageAsRead = async (args) =>
  markSingle(args.messageId, args.userId, "readAt");

/* =========================
   MARK MESSAGE DELIVERED
========================= */
export const markMessageAsDelivered = async (args) =>
  markSingle(args.messageId, args.userId, "deliveredAt");

/* =========================
   BULK MARK CHAT DELIVERED
========================= */
export const markChatAsDelivered = async ({
  chatId,
  userId
}) => {
  return Message.updateMany(
    {
      chatId,
      "deliveredAt.userId": { $ne: userId }
    },
    {
      $push: {
        deliveredAt: {
          userId,
          at: new Date()
        }
      }
    }
  );
};

/* =========================
   BULK MARK CHAT READ
========================= */
export const markChatAsRead = async ({
  chatId,
  userId
}) => {
  return Message.updateMany(
    {
      chatId,
      "readAt.userId": { $ne: userId }
    },
    {
      $push: {
        readAt: {
          userId,
          at: new Date()
        }
      }
    }
  );
};

/* =========================
   MARK READ UP TO MESSAGE
========================= */
export const markChatAsReadUpTo = async ({
  chatId,
  userId,
  messageId
}) => {
  const target = await Message.findById(messageId);
  ensureExists(target, "Message not found");

  return Message.updateMany(
    {
      chatId,
      createdAt: { $lte: target.createdAt },
      "readAt.userId": { $ne: userId }
    },
    {
      $push: {
        readAt: {
          userId,
          at: new Date()
        }
      }
    }
  );
};