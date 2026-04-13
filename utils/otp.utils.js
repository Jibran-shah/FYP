import { redisClient } from "../config/redis.js";
import { InvalidTokenError } from "../errors/index.js";
import { InternalServerError } from "../errors/index.js";


/**
 * Increase OTP attempt counter
 */
export const increaseOtpAttempts = async (email) => {
  const key = `otp_attempts:${email}`;

  const attempts = await redisClient.incr(key);

  // first attempt sets expiry
  if (attempts === 1) {
    await redisClient.expire(key, 300); // 5 min window
  }

  return attempts;
};

/**
 * Check if OTP attempts exceeded
 */
export const checkOtpAttempts = async (
  email,
  maxAttempts = 5
) => {
  const key = `otp_attempts:${email}`;

  const attempts = await redisClient.get(key);

  if (attempts && parseInt(attempts) >= maxAttempts) {
    throw new InvalidTokenError(
      "Too many OTP attempts. Try again later."
    );
  }
};

/**
 * Reset attempts after success
 */
export const resetOtpAttempts = async (email) => {
  await redisClient.del(`otp_attempts:${email}`);
};


/**
 * Limits how often OTP can be requested
 */
export const checkOtpRequestLimit = async (
  email,
  limit = 3,
  windowSec = 600 // 10 minutes
) => {
  const key = `otp_req:${email}`;

  const current = await redisClient.incr(key);

  if (current === 1) {
    await redisClient.expire(key, windowSec);
  }

  if (current > limit) {
    throw new InternalServerError(
      "Too many OTP requests. Try again later."
    );
  }
};