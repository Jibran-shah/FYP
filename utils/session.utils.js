import { v4 as uuidv4 } from "uuid";

import {
  setValue,
  getOrNull,
  deleteKey,
  addToSet,
  removeFromSet,
  getSetMembers,
  deleteMany,
  buildKey,
} from "./redis.utils.js";

import { normalizeUserId } from "./user.utils.js";
import { RedisError } from "../errors/Redis.error.js";
import { parseExpiresToSeconds } from "./token.utils.js";
import { AUTH_CONFIG } from "../config/auth.config.js";

export class SessionSystem {
  constructor({ prefix, ttl }) {
    this.prefix = prefix;
    this.ttl = ttl;
  }

  sessionKey(userId, sessionId) {
    return buildKey(
      this.prefix,
      normalizeUserId(userId),
      sessionId
    );
  }

  userKey(userId) {
    return buildKey(
      this.prefix,
      normalizeUserId(userId)
    );
  }

  /* ================= SAVE ================= */
  async save(userId, sessionId, token) {

    try {
      await Promise.all([
        setValue({
          key:this.sessionKey(userId, sessionId),
          value:token,
          ttl:this.ttl
        }),
        addToSet(
          this.userKey(userId),
          sessionId
        ),
      ]);
    } catch (err) {
      throw new RedisError({
        message: "Save session failed",
        cause: err,
      });
    }
  }

  /* ================= GET ================= */
  async get(userId, sessionId) {
    return getOrNull(
      this.sessionKey(userId, sessionId)
    );
  }

  /* ================= DELETE ONE ================= */
  async delete(userId, sessionId) {
    try {
      await Promise.all([
        deleteKey(
          this.sessionKey(userId, sessionId)
        ),
        removeFromSet(
          this.userKey(userId),
          sessionId
        ),
      ]);
    } catch (err) {
      throw new RedisError({
        message: "Delete session failed",
        cause: err,
      });
    }
  }

  /* ================= DELETE ALL ================= */
  async deleteAll(userId) {
    try {
      const setKey = this.userKey(userId);

      const sessionIds =
        await getSetMembers(setKey);

      if (!sessionIds.length) return 0;

      const keys = sessionIds.map((id) =>
        this.sessionKey(userId, id)
      );

      await deleteMany([...keys, setKey]);

      return sessionIds.length;
    } catch (err) {
      throw new RedisError({
        message: "Delete all sessions failed",
        cause: err,
      });
    }
  }

  generateId() {
    return uuidv4();
  }
}


export const refreshSessionSystem = new SessionSystem({
  prefix: "refresh",
  ttl: parseExpiresToSeconds(AUTH_CONFIG.REFRESH_TOKEN.EXPIRY),
});

