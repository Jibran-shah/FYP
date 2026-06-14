import { handlePresence } from "../connection/presence.js";
import { hydrateUserRooms } from "../connection/hydrateRooms.js";
import { registerDisconnect } from "../connection/disconnect.js";

export async function connectionPlugin(io, socket) {
  const userId = socket?.data?.user?.id;
  
  console.log(
    `[ConnectionPlugin] Init → socket=${socket.id}, user=${userId}`
  );

  socket.data.ready = false;

  try {

    console.log(
      `[ConnectionPlugin] Initializing presence → user=${userId}`
    );

    await handlePresence(io, socket, userId);

    console.log(
      `[ConnectionPlugin] Presence initialized → user=${userId}`
    );
  } catch (err) {
    console.error(
      `[ConnectionPlugin] Presence init failed → user=${userId}:`,
      err
    );
  }

  // --------------------------------
  // ROOM HYDRATION
  // --------------------------------
  try {
    console.log(
      `[ConnectionPlugin] Hydrating rooms → user=${userId}`
    );

    const rooms = await hydrateUserRooms(userId);

    if (socket.disconnected) {
      console.log(
        `[ConnectionPlugin] Socket disconnected during hydration → user=${userId}`
      );
      return;
    }

    for (const roomId of rooms) {
      socket.join(roomId);
    }

    socket.data.ready = true;

    socket.emit("connection.ready", {
      userId,
      roomsCount: rooms.length,
      timestamp: Date.now()
    });

    console.log(
      `[ConnectionPlugin] connection.ready emitted → user=${userId}`
    );

  } catch (err) {
    console.error(
      `[ConnectionPlugin] Room hydration failed → user=${userId}:`,
      err
    );

    socket.emit("connection.failed", {
      reason: "ROOM_HYDRATION_FAILED",
      timestamp: Date.now()
    });
  }

  // --------------------------------
  // SINGLE SOURCE OF TRUTH
  // --------------------------------
  registerDisconnect(io, socket, userId);
}