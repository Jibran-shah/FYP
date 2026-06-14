import { presenceStore } from "../utils/presence.store.js";
import { presenceSubscriptions } from "../utils/presenceSubscription.store.js";

/**
 * Attaches socket disconnect lifecycle handler
 */
export function registerDisconnect(io, socket, userId) {

  if (socket.data.disconnectRegistered) return;
  socket.data.disconnectRegistered = true;

  socket.on("disconnect", async (reason) => {
    try {

      const { socketCount } = await presenceStore.removeSocket(
        userId,
        socket.id
      );

      if (socketCount === 0) {
        presenceSubscriptions.emitOffline(io, userId, {
          reason
        });
      }

    } catch (err) {
      console.error(
        `[Disconnect] user=${userId} socket=${socket.id}`,
        err
      );
    }
  });
}