import { presenceSubscriptions } from "../utils/presenceSubscription.store.js";

/**
 * Presence plugin:
 * Handles client subscription to presence updates only.
 */
export function presencePlugin(io, socket) {

  // -----------------------------
  // SUBSCRIBE TO USER PRESENCE UPDATES
  // -----------------------------
  socket.on("presence.subscribe", ({ targetUserId }) => {
    if (!targetUserId) return;

    socket.join(presenceSubscriptions.room(targetUserId));
  });

  // -----------------------------
  // UNSUBSCRIBE
  // -----------------------------
  socket.on("presence.unsubscribe", ({ targetUserId }) => {
    if (!targetUserId) return;

    socket.leave(presenceSubscriptions.room(targetUserId));
  });
}