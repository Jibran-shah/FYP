import { v4 as uuidv4 } from "uuid";

import {
  getOrNull,
  setWithTTL,
  deleteKey,
  addToSet,
  removeFromSet,
  getSetMembers,
  deleteMany
} from "./redis.utils.js";

import { RedisError } from "../errors/Redis.error.js";
import { normalizeUserId } from "./user.utils.js";

/* ================= KEYS ================= */

const sessionKey = (userId, sessionId) =>
  `refresh:${normalizeUserId(userId)}:${sessionId}`;

const userSessionsKey = (userId) =>
  `refresh:${normalizeUserId(userId)}`;

/* ================= SESSION ================= */

export const saveSession = async (userId, sessionId, token, ttl) => {
  try {
    await Promise.all([
      setWithTTL(sessionKey(userId, sessionId), token, ttl),
      addToSet(userSessionsKey(userId), sessionId),
    ]);
  } catch (err) {
    throw new RedisError({ message: "Save session failed", cause: err });
  }
};

export const getSession = (userId, sessionId) =>
  getOrNull(sessionKey(userId, sessionId));

export const deleteSession = async (userId, sessionId) => {
  try {
    await Promise.all([
      deleteKey(sessionKey(userId, sessionId)),
      removeFromSet(userSessionsKey(userId), sessionId),
    ]);
  } catch (err) {
    throw new RedisError({ message: "Delete session failed", cause: err });
  }
};

export const deleteAllSessions = async (userId) => {
  try {
    const setKey = userSessionsKey(userId);
    const sessionIds = await getSetMembers(setKey);

    if (!sessionIds.length) return 0;

    const keys = sessionIds.map(id =>
      sessionKey(userId, id)
    );

    await deleteMany([...keys, setKey]);

    return sessionIds.length;
  } catch (err) {
    throw new RedisError({
      message: "Delete all sessions failed",
      cause: err,
    });
  }
};

export const generateSessionId = () => uuidv4();