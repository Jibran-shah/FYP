class PresenceSubscriptionStore {
  
  room(userId) {
    return `presence:subscribers:${userId}`;
  }

  subscribe(socket, userId) {
    socket.join(this.room(userId));
  }

  unsubscribe(socket, userId) {
    socket.leave(this.room(userId));
  }

  emit(io, userId, event, data = {}) {
    io.to(this.room(userId)).emit(event, {
      userId,
      timestamp: Date.now(),
      ...data
    });
  }

  emitOnline(io, userId, data = {}) {
    this.emit(io, userId, "user.presence.online", data);
  }

  emitOffline(io, userId, data = {}) {
    this.emit(io, userId, "user.presence.offline", data);
  }
}

export const presenceSubscriptions = new PresenceSubscriptionStore();