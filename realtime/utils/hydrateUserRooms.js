import { DirectChat } from "../../models/DirectChat.model.js";
import { GroupChat } from "../../models/GroupChat.model.js";
import { roomStore } from "./room.store.js";

/**
 * Builds user room list and ensures room cache exists
 * (Mongo → transformation → Redis cache)
 */
export async function hydrateUserRooms(userId) {

  // -----------------------------
  // DIRECT CHATS
  // -----------------------------
  const directChats = await DirectChat.find({
    participants: userId,
    isDeleted: false
  }).select("_id participants");

  const directRoomResults = await Promise.all(
    directChats.map(async (chat) => {
      const roomId = chat._id.toString();

      await roomStore.create({
        roomId,
        type: "DIRECT_CHAT",
        members: chat.participants.map(String)
      });

      return roomId;
    })
  );

  // -----------------------------
  // GROUP CHATS
  // -----------------------------
  const groupChats = await GroupChat.find({
    "members.userId": userId,
    isDeleted: false
  }).select("_id members");

  const groupRoomResults = await Promise.all(
    groupChats.map(async (group) => {
      const roomId = group._id.toString();

      const members = group.members
        .filter(m => m.isActive)
        .map(m => m.userId.toString());

      await roomStore.create({
        roomId,
        type: "GROUP_CHAT",
        members
      });

      return roomId;
    })
  );

  // -----------------------------
  // FINAL RESULT
  // -----------------------------
  return [...directRoomResults, ...groupRoomResults];
}