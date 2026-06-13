import { roomStore } from "../utils/room.store.js";

export async function canAccessRoom(socket, roomId) {
  const userId = socket.user.id;

  const typeModel = socket.roomsMeta?.[roomId] || "DIRECT_CHAT";

  return roomStore.validateAccess(roomId, userId, typeModel);
}