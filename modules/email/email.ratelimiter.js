import { redisClient } from "../../config/redis.js";

export const emailRateLimiter = async ({
  key,
  limit = 5,
  windowSec = 3600
}) => {
  try {
    // ensure connection (safe guard)
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }

    const current = await redisClient.incr(key);

    // set expiry only on first request
    if (current === 1) {
      await redisClient.expire(key, windowSec);
    }

    if (current > limit) {
      throw new Error("Too many email requests. Please try later.");
    }

  } catch (err) {
    console.error("Rate limiter error:", err.message);

    // fail-open (don’t block system)
    return;
  }
};