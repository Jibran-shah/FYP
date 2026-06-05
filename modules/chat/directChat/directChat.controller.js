import * as directChatService from "./directChat.service.js";

export const createDirectChat = async (req, res) => {
  const userId1 = req.user.id;
  const { userId2 } = req.body;

  const chat = await directChatService.createDirectChat({
    userId1,
    userId2
  });

  return res.status(201).json({
    success: true,
    data: chat
  });
}


export const getDirectChat = async (req, res) => {

  const { chatId } = req.params;

  const chat = await directChatService.getDirectChat(chatId);

  return res.status(200).json({
    success: true,
    data: chat
  });
}


export const getUserDirectChats = async (req, res) => {
  const userId = req.user.id;
  const chats = await directChatService.getUserDirectChats(userId);
  return res.status(200).json({
    success: true,
    data: chats
  });
}


export const deleteDirectChatForUser = async (req, res) => {
  const { chatId } = req.params;
  const userId= req.user.id;

  const result = await directChatService.deleteDirectChatForUser({
    chatId,
    userId
  });

  return res.status(200).json({
    success: true,
    data: result
  });
}


export const blockDirectChatUser = async (req, res) => {
  const { chatId } = req.params;
  const blockerId = req.user.id;

  const result = await directChatService.blockUserInDirectChat({
    chatId,
    blockerId
  });

  return res.status(200).json({
    success: true,
    data: result
  });
}