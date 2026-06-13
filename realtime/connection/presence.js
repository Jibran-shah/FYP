import { presenceStore } from "../utils/presence.store.js";
import { presenceSubscriptions } from "../utils/presenceSubscription.store.js";

/**
 * CONNECT lifecycle: user comes online
 */
export async function handlePresence(io, socket, userId) {

  const { socketCount } = await presenceStore.addSocket(
    userId,
    socket.id
  );

  // first socket → user is online
  if (socketCount === 1) {
    presenceSubscriptions.emitOnline(io, userId);
  }
}