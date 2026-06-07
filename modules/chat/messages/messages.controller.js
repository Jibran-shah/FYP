import * as messageService from "./messages.service.js";

/* =========================
   GET CHAT MESSAGES
========================= */
export const getChatMessages = async (req, res) => {
  const result = await messageService.getChatMessages({
    chatId: req.validated.params.chatId,
    userId: req.user.id,
    ...req.validated.query
  });

  res.status(200).json({
    success: true,
    message: "Messages fetched successfully",
    data: result
  });
};

/* =========================
   SEND MESSAGE
========================= */
export const sendMessage = async (req, res) => {
  const result = await messageService.sendMessage({
    senderId: req.user.id,
    ...req.validated.body
  });

  res.status(201).json({
    success: true,
    message: "Message sent successfully",
    data: result
  });
};

/* =========================
   EDIT MESSAGE
========================= */
export const editMessage = async (req, res) => {
  const result = await messageService.editMessage({
    messageId: req.validated.params.messageId,
    userId: req.user.id,
    text: req.validated.body.text
  });

  res.status(200).json({
    success: true,
    message: "Message edited successfully",
    data: result
  });
};

/* =========================
   DELETE MESSAGE (SOFT)
========================= */
export const deleteMessage = async (req, res) => {
  const result = await messageService.deleteMessage({
    messageId: req.validated.params.messageId,
    userId: req.user.id
  });

  res.status(200).json({
    success: true,
    message: "Message deleted successfully",
    data: result
  });
};

/* =========================
   MARK SINGLE MESSAGE AS READ
========================= */
export const markMessageAsRead = async (req, res) => {
  const result = await messageService.markMessageAsRead({
    messageId: req.validated.params.messageId,
    userId: req.user.id
  });

  res.status(200).json({
    success: true,
    message: "Message marked as read",
    data: result
  });
};

/* =========================
   MARK SINGLE MESSAGE AS DELIVERED
========================= */
export const markMessageAsDelivered = async (req, res) => {
  const result = await messageService.markMessageAsDelivered({
    messageId: req.validated.params.messageId,
    userId: req.user.id
  });

  res.status(200).json({
    success: true,
    message: "Message marked as delivered",
    data: result
  });
};

/* =========================
   BULK: CHAT DELIVERED
========================= */
export const markChatAsDelivered = async (req, res) => {
  const result = await messageService.markChatAsDelivered({
    chatId: req.validated.params.chatId,
    userId: req.user.id
  });

  res.status(200).json({
    success: true,
    message: "Chat marked as delivered",
    data: result
  });
};

/* =========================
   BULK: CHAT READ
========================= */
export const markChatAsRead = async (req, res) => {
  const result = await messageService.markChatAsRead({
    chatId: req.validated.params.chatId,
    userId: req.user.id
  });

  res.status(200).json({
    success: true,
    message: "Chat marked as read",
    data: result
  });
};

/* =========================
   CHAT READ UP TO MESSAGE
========================= */
export const markChatAsReadUpTo = async (req, res) => {
  const result = await messageService.markChatAsReadUpTo({
    chatId: req.validated.params.chatId,
    messageId: req.validated.params.messageId,
    userId: req.user.id
  });

  res.status(200).json({
    success: true,
    message: "Chat marked as read up to message",
    data: result
  });
};