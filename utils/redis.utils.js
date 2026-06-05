import { redis } from "../config/redis.js";
import crypto from "crypto"

export const getOrNull = async (key) => {
  if (!key) return null;
  try {
    return await redis.get(key);
  } catch (err) {
    console.error("Redis GET failed:", key, err.message);
    return null;
  }
};

export const setValue = async ({ key, value, ttl }) => {
  if (!key) return;

  try {
    const safeValue =
      typeof value === "string"
        ? value
        : JSON.stringify(value);

    if (typeof ttl === "number" && Number.isFinite(ttl) && ttl > 0) {
      return await redis.set(key, safeValue, "EX", ttl);
    }

    return await redis.set(key, safeValue);
  } catch (err) {
    console.error("Redis SET failed:", { key, value, ttl }, err.message);
    throw err
  }
};


export const deleteKey = async (key) => {
  if (!key) return;

  try {
    await redis.del(key);
  } catch (err) {
    console.error("Redis DEL failed:", key, err.message);
  }
};


export const deleteMany = async (keys = []) => {
  if (!keys.length) return 0;

  try {
    const pipeline = redis.pipeline();

    for (const key of keys) {
      if (key) {
        pipeline.del(key);
      }
    }

    return await pipeline.exec();
  } catch (err) {
    console.error("Redis BULK DELETE failed:", err.message);
    return 0;
  }
};


export const verifyValue = async ({
  key,
  value
}) => {
  const stored = await getOrNull(key);

  if (!stored) {
    return false;
  }

  return stored === String(value);
};

export const existsKey = async (key) => {
  if (!key) return false;

  try {
    return (await redis.exists(key)) === 1;
  } catch (err) {
    console.error("Redis EXISTS failed:", key, err.message);
    return false;
  }
};

export const getTTL = async (key) => {
  if (!key) return null;

  try {
    return await redis.ttl(key);
  } catch (err) {
    console.error("Redis TTL failed:", key, err.message);
    return null;
  }
};

export const expireKey = async (key, ttl) => {
  if (!key || !ttl) return false;

  try {
    return await redis.expire(key, ttl);
  } catch (err) {
    console.error("Redis EXPIRE failed:", key, err.message);
    return false;
  }
};


export const increment = async (key) => {
  if (!key) return 0;

  try {
    return await redis.incr(key);
  } catch (err) {
    console.error("Redis INCR failed:", key, err.message);
    return 0;
  }
};

/**
 * Increment and auto-apply TTL on first creation
 */
export const incrementWithTTL = async (
  key,
  ttl = null
) => {
  if (!key) return 0;

  try {
    const count = await redis.incr(key);

    if (count === 1 && ttl) {
      await redis.expire(key, ttl);
    }

    return count;
  } catch (err) {
    console.error("Redis INCR+TTL failed:", key, err.message);
    return 0;
  }
};


export const decrement = async (key) => {
  if (!key) return 0;

  try {
    return await redis.decr(key);
  } catch (err) {
    console.error("Redis DECR failed:", key, err.message);
    return 0;
  }
};


export const addToSet = async (
  key,
  value
) => {
  if (!key) return 0;

  try {
    return await redis.sadd(key, value);
  } catch (err) {
    console.error("Redis SADD failed:", key, err.message);
    return 0;
  }
};

export const removeFromSet = async (
  key,
  value
) => {
  if (!key) return 0;

  try {
    return await redis.srem(key, value);
  } catch (err) {
    console.error("Redis SREM failed:", key, err.message);
    return 0;
  }
};

export const getSetMembers = async (key) => {
  if (!key) return [];

  try {
    return await redis.smembers(key);
  } catch (err) {
    console.error("Redis SMEMBERS failed:", key, err.message);
    return [];
  }
};

export const isSetMember = async (
  key,
  value
) => {
  if (!key) return false;

  try {
    return (await redis.sismember(key, value)) === 1;
  } catch (err) {
    console.error("Redis SISMEMBER failed:", key, err.message);
    return false;
  }
};

export const setHashField = async ({
  key,
  field,
  value
}) => {
  if (!key || !field) return;

  try {
    await redis.hset(key, field, String(value));
  } catch (err) {
    console.error("Redis HSET failed:", key, err.message);
  }
};


export const getHashField = async (
  key,
  field
) => {
  if (!key || !field) return null;

  try {
    return await redis.hget(key, field);
  } catch (err) {
    console.error("Redis HGET failed:", key, err.message);
    return null;
  }
};

export const deleteHashField = async (
  key,
  field
) => {
  if (!key || !field) return;

  try {
    await redis.hdel(key, field);
  } catch (err) {
    console.error("Redis HDEL failed:", key, err.message);
  }
};

export const buildKey = (...parts) => {
  return parts
    .filter((part) => part !== undefined && part !== null)
    .map(String)
    .join(":");
};

export const hashValue = (value) => {
  return crypto.createHash("sha256").update(String(value)).digest("hex");
};
export const setWithTTL = async (key, value, ttl) => {
  const stack = new Error().stack;
  try {

    if (!key) throw new Error("Missing Redis key");

    if (typeof ttl === "number" && Number.isFinite(ttl) && ttl > 0) {
      return await redis.set(key, String(value), "EX", ttl);
    }

    return await redis.set(key, String(value));

  } catch (err) {
    throw err;
  }
};