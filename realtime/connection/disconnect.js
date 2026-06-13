import { presenceStore } from "../utils/presence.store.js";
import { presenceSubscriptions } from "../utils/presenceSubscription.store.js";

/**
 * Attaches socket disconnect lifecycle handler
 */
export function registerDisconnect(io, socket, userId) {

  // prevent duplicate binding (safe custom guard)
  if (socket.__disconnectRegistered) return;
  socket.__disconnectRegistered = true;

  socket.on("disconnect", async () => {
    try {

      const { socketCount } = await presenceStore.removeSocket(
        userId,
        socket.id
      );

      // last socket → offline event
      if (socketCount === 0) {
        presenceSubscriptions.emitOffline(io, userId);
      }

    } catch (err) {
      console.error("Disconnect error:", err.message);
    }
  });
}