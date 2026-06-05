import { AppError } from "../../../errors/App.error.js";
import { NotFoundError } from "../../../errors/Http.error.js";
import { DirectChat } from "../../../models/DirectChat.model.js";

export const createDirectChat = async ({ userId1, userId2 }) => {

  if (userId1 === userId2) {
    throw new AppError("Cannot create direct chat with same user", 400);
  }

  const existingChat = await DirectChat.findOne({
    participants: { $all: [userId1, userId2], $size: 2 },
    isDeleted: false
  });

  if (existingChat) {
    return existingChat;
  }

  const chat = await DirectChat.create({
    participants: [userId1, userId2]
  });

  // 🔥 SYNC TO REDIS
  await roomStore.create({
    roomId: chat._id.toString(),
    type: "DIRECT_CHAT",
    members: [userId1.toString(), userId2.toString()]
  });

  return chat;
};


export const getDirectChat = async (chatId) => {

  const chat = await DirectChat.findById(chatId);

  if (!chat || chat.isDeleted) {
    throw new NotFoundError("Direct chat not found", 404);
  }

  // 🔥 ensure Redis is warm (lazy cache)
  const members = await roomStore.getMembers(chatId);

  if (!members.length) {
    await roomStore.create({
      roomId: chat._id.toString(),
      type: "DIRECT_CHAT",
      members: chat.participants.map(String)
    });
  }

  return chat;
};

/* =========================
   GET USER DIRECT CHATS
========================= */
export const getUserDirectChats = async (userId) => {

  const chats = await DirectChat.find({
    participants: userId,
    isDeleted: false
  }).sort({ updatedAt: -1 });

  return chats;
};

export const deleteDirectChatForUser = async ({ chatId, userId }) => {

  const chat = await DirectChat.findById(chatId);

  if (!chat || chat.isDeleted) {
    throw new NotFoundError("Direct chat not found", 404);
  }

  if (!chat.participants.includes(userId)) {
    throw new AppError("User not part of this chat", 403);
  }

  if (!chat.deletedFor.includes(userId)) {
    chat.deletedFor.push(userId);
  }

  await chat.save();

  // 🔥 REMOVE USER FROM REDIS ROOM
  await roomStore.removeMember(chatId.toString(), userId.toString());

  return { message: "Chat deleted for user" };
};

export const blockUserInDirectChat = async ({ chatId, blockerId }) => {

  const chat = await DirectChat.findById(chatId);

  if (!chat || chat.isDeleted) {
    throw new AppError("Direct chat not found", 404);
  }

  if (!chat.participants.includes(blockerId)) {
    throw new AppError("User not part of this chat", 403);
  }

  chat.blockedBy = blockerId;

  await chat.save();

  // 🔥 OPTION 1: remove both users from Redis room (strict block)
  await roomStore.delete(chatId.toString());

  // OR 🔥 OPTION 2 (better): keep room but enforce block in validateAccess layer
  // await roomStore.removeMember(chatId, blockedUserId)

  return { message: "User blocked in chat" };
};