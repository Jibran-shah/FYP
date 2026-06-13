import { DirectChat } from "../../models/DirectChat.model.js";
import { GroupChat } from "../../models/GroupChat.model.js";
import { roomStore } from "../utils/room.store.js";

/**
 * Hydrates user rooms:
 * MongoDB → Redis cache → returns roomIds
 */
export async function hydrateUserRooms(userId) {

  const roomIds = [];

  // -----------------------------
  // DIRECT CHATS
  // -----------------------------
  const directChats = await DirectChat.find({
    participants: userId,
    isDeleted: false
  }).select("_id participants");

  for (const chat of directChats) {
    const roomId = chat._id.toString();

    roomIds.push(roomId);

    await roomStore.create({
      roomId,
      type: "DIRECT_CHAT",
      members: chat.participants.map(String)
    });
  }

  // -----------------------------
  // GROUP CHATS
  // -----------------------------
  const groupChats = await GroupChat.find({
    "members.userId": userId,
    isDeleted: false
  }).select("_id members");

  for (const group of groupChats) {
    const roomId = group._id.toString();

    const members = group.members
      .filter(m => m.isActive)
      .map(m => m.userId.toString());

    roomIds.push(roomId);

    await roomStore.create({
      roomId,
      type: "GROUP_CHAT",
      members
    });
  }

  return roomIds;
}