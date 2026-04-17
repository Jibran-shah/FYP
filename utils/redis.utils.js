import { redis } from "../config/redis.js";
import crypto from "crypto";

/* ================= KEY ================= */

export const buildKey = (...parts) => {
  if (!parts?.length || parts.some(p => !p)) return null;
  return parts.join(":");
};

/* ================= BASIC OPS ================= */

export const getOrNull = async (key) => {
  if (!key) return null;
  try {
    return await redis.get(key);
  } catch (err) {
    console.error("Redis GET error:", key, err.message);
    return null;
  }
};

export const setWithTTL = async (key, value, ttl) => {
  if (!key) return;
  try {
    // ✅ ioredis style
    if (ttl) {
      await redis.set(key, value, "EX", ttl);
    } else {
      await redis.set(key, value);
    }
  } catch (err) {
    console.error("Redis SET error:", key, err.message);
  }
};

export const deleteKey = async (key) => {
  if (!key) return;
  try {
    await redis.del(key);
  } catch (err) {
    console.error("Redis DEL error:", key, err.message);
  }
};

/* ================= COUNTERS ================= */

export const incrementWithTTL = async (key, ttl) => {
  const value = await redis.incr(key);

  if (value === 1 && ttl) {
    await redis.expire(key, ttl);
  }

  return value;
};

/* ================= HASH ================= */

export const hashValue = (val) =>
  crypto.createHash("sha256").update(val).digest("hex");

export const storeHashed = async ({ key, value, ttl }) => {
  const hashed = hashValue(value);
  await setWithTTL(key, hashed, ttl);
};

export const verifyHashed = async ({ key, value }) => {
  const stored = await getOrNull(key);
  if (!stored) return false;

  return stored === hashValue(value);
};

/* ================= SET OPS ================= */

export const addToSet = (key, val) => redis.sadd(key, val);
export const removeFromSet = (key, val) => redis.srem(key, val);
export const getSetMembers = (key) => redis.smembers(key);

/* ================= PIPELINE ================= */

export const deleteMany = async (keys = []) => {
  if (!keys.length) return 0;

  const pipeline = redis.pipeline(); // ✅ ioredis uses pipeline()

  keys.forEach(k => pipeline.del(k));

  return pipeline.exec();
};