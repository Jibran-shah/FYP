import { redis } from "../../config/redis.js";

export const emailRateLimiter = async ({
  key,
  limit = 5,
  windowSec = 3600,
}) => {
  try {
    const current = await redis.incr(key);

    if (current === 1) {
      await redis.expire(key, windowSec);
    }

    if (current > limit) {
      throw new Error("Too many email requests. Please try later.");
    }

    return current;
  } catch (err) {
    console.error("Rate limiter error:", err.message);
    throw err; // or handle upstream
  }
};