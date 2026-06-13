import { EVENTS } from "../constants/events.constants.js";

class PresenceSubscriptionStore {

  // -----------------------------
  // INTERNAL CHANNEL KEY
  // -----------------------------
  channel(userId) {
    return `presence:subscribers:${userId}`;
  }

  // -----------------------------
  // SUBSCRIBE TO USER PRESENCE
  // -----------------------------
  subscribe(socket, userId) {
    socket.join(this.channel(userId));
  }

  // -----------------------------
  // UNSUBSCRIBE FROM USER PRESENCE
  // -----------------------------
  unsubscribe(socket, userId) {
    socket.leave(this.channel(userId));
  }

  // -----------------------------
  // CORE EMIT FUNCTION
  // -----------------------------
  emit(io, userId, event, data = {}) {
    io.to(this.channel(userId)).emit(event, {
      userId,
      timestamp: Date.now(),
      ...data
    });
  }

  // -----------------------------
  // PRESENCE EVENTS
  // -----------------------------
  emitOnline(io, userId, data = {}) {
    this.emit(io, userId, EVENTS.PRESENCE.ONLINE, data);
  }

  emitOffline(io, userId, data = {}) {
    this.emit(io, userId, EVENTS.PRESENCE.OFFLINE, data);
  }

  // -----------------------------
  // OPTIONAL: CLEANUP ON DISCONNECT
  // (safe to call, prevents ghost logic confusion)
  // -----------------------------
  cleanup(socket, userId) {
    socket.leave(this.channel(userId));
  }
}

export const presenceSubscriptions = new PresenceSubscriptionStore();