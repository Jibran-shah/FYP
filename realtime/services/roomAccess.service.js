import { DirectChat } from "../models/DirectChat.model.js";
import { GroupChat } from "../models/GroupChat.model.js";
import { roomStore } from "../realtime/utils/room.store.js";

export async function validateRoomAccess(roomId, userId, typeModel) {

  const exists = await roomStore.getType(roomId);

  if (exists) {
    return roomStore.isMember(roomId, userId);
  }

  let room;

  if (typeModel === "DIRECT_CHAT") {
    room = await DirectChat.findById(roomId).lean();
  }

  if (typeModel === "GROUP_CHAT") {
    room = await GroupChat.findById(roomId).lean();
  }

  if (!room) return false;

  await roomStore.create({
    roomId,
    type: typeModel,
    members: room.members || room.participants || []
  });

  return roomStore.isMember(roomId, userId);
}