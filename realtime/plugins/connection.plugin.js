import { handlePresence } from "../connection/presence.js";
import { hydrateUserRooms } from "../connection/hydrateRooms.js";
import { registerDisconnect } from "../connection/disconnect.js";

export function connectionPlugin(io, socket) {

  const userId = socket.user.id;

  let isAlive = true;

  // mark socket death on disconnect
  socket.on("disconnect", () => {
    isAlive = false;
  });

  // -----------------------------
  // PRESENCE
  // -----------------------------
  handlePresence(io, socket, userId);

  // -----------------------------
  // ROOM HYDRATION
  // -----------------------------
  hydrateUserRooms(userId)
    .then((rooms) => {

      if (!isAlive) return;

      rooms.forEach(roomId => {
        if (isAlive) socket.join(roomId);
      });

      if (!isAlive) return;

      socket.emit("connection.ready", {
        userId,
        roomsCount: rooms.length,
        timestamp: Date.now()
      });
    })
    .catch(err => {
      console.error("Room hydration error:", err.message);
    });

  // -----------------------------
  // DISCONNECT BINDING
  // -----------------------------
  registerDisconnect(io, socket, userId);
}