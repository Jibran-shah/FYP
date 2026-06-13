import {
  setHashField,
  getHashField,
  buildKey
} from "../../utils/redis.utils.js";

import { redis } from "../../config/redis.js";

class UserPresenceStore {
  constructor(prefix = "user") {
    this.prefix = prefix;
  }

  key(userId) {
    return buildKey(this.prefix, userId, "presence");
  }

  socketKey(userId) {
    return buildKey(this.prefix, userId, "sockets");
  }

  // -----------------------------
  // ADD SOCKET
  // -----------------------------
  async addSocket(userId, socketId) {
    const key = this.socketKey(userId);

    const socketCount = await redis.sadd(key, socketId);

    const count = await redis.scard(key);

    // first socket → online
    if (count === 1) {
      await this.setStatus(userId, "online");
    }

    await this.setPresence(userId, {
      socketCount: count
    });

    return { socketCount: count };
  }

  // -----------------------------
  // REMOVE SOCKET
  // -----------------------------
  async removeSocket(userId, socketId) {
    const key = this.socketKey(userId);

    await redis.srem(key, socketId);

    const count = await redis.scard(key);

    if (count === 0) {
      await this.setStatus(userId, "offline");

      await this.setPresence(userId, {
        socketCount: 0,
        lastSeen: Date.now()
      });
    } else {
      await this.setPresence(userId, {
        socketCount: count
      });
    }

    return { socketCount: count };
  }

  // -----------------------------
  // GET SOCKET COUNT
  // -----------------------------
  async getSocketCount(userId) {
    return redis.scard(this.socketKey(userId));
  }

  // -----------------------------
  // STATUS
  // -----------------------------
  async setStatus(userId, status) {
    return setHashField({
      key: this.key(userId),
      field: "status",
      value: status
    });
  }

  async getStatus(userId) {
    return getHashField(this.key(userId), "status");
  }

  async isOnline(userId) {
    const status = await this.getStatus(userId);
    return status === "online";
  }

  // -----------------------------
  // PRESENCE META
  // -----------------------------
  async setPresence(userId, data) {
    const key = this.key(userId);

    const ops = [];

    if (data.socketCount !== undefined) {
      ops.push(
        setHashField({
          key,
          field: "socketCount",
          value: data.socketCount
        })
      );
    }

    if (data.currentChat !== undefined) {
      ops.push(
        setHashField({
          key,
          field: "currentChat",
          value: data.currentChat
        })
      );
    }

    if (data.lastSeen !== undefined) {
      ops.push(
        setHashField({
          key,
          field: "lastSeen",
          value: data.lastSeen
        })
      );
    }

    await Promise.all(ops);
  }

  // -----------------------------
  // CURRENT CHAT
  // -----------------------------
  async setCurrentChat(userId, roomId) {
    return setHashField({
      key: this.key(userId),
      field: "currentChat",
      value: roomId
    });
  }

  async clearCurrentChat(userId) {
    return setHashField({
      key: this.key(userId),
      field: "currentChat",
      value: ""
    });
  }

  async getCurrentChat(userId) {
    return getHashField(this.key(userId), "currentChat");
  }
}

export const presenceStore = new UserPresenceStore();