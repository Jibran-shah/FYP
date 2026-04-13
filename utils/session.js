import { redisClient } from "../config/redis.js";
import { v4 as uuidv4 } from "uuid";

/**
 * Save a refresh token in Redis
 * @param {string} userId - MongoDB user id
 * @param {string} sessionId - unique session id (UUID or random string)
 * @param {string} refreshToken - JWT refresh token
 * @param {number} ttl - time to live in seconds
 */
export const saveSession = async (userId, sessionId, refreshToken, ttl) => {
  const key = `refresh:${userId}:${sessionId}`;
  await redisClient.set(key, refreshToken, { EX: ttl });
};

/**
 * Get a refresh token from Redis by userId + sessionId
 */
export const getSession = async (userId, sessionId) => {
  const key = `refresh:${userId}:${sessionId}`;
  const token = await redisClient.get(key);
  return token;
};

/**
 * Delete a single session by userId + sessionId
 */
export const deleteSession = async (userId, sessionId) => {
  const key = `refresh:${userId}:${sessionId}`;
  await redisClient.del(key);
};

/**
 * Delete all sessions of a user
 * Useful for logout all devices
 */
export const deleteAllSessions = async (userId) => {
  const pattern = `refresh:${userId}:*`;
  const keys = [];
  // Scan all keys for this user
  for await (const key of redisClient.scanIterator({ MATCH: pattern })) {
    keys.push(key);
  }
  if (keys.length > 0) await redisClient.del(...keys);
};


/**
 * Generate a unique session id (UUID v4)
 */
export const generateSessionId = () => {
  return uuidv4();
};
