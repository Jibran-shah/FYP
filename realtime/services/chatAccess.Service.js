import { roomStore } from "../utils/room.store.js";

export async function canAccessRoom(socket, roomId) {
  const userId = socket.data?.user?.id;

  if (!roomId) {
    return false;
  }

  return roomStore.validateAccess(roomId, userId);
}