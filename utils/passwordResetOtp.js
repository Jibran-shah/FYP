import { redisClient } from "../config/redis.js";

export const setPasswordResetOtp = async (email, otp, ttl = 300) => {
  await redisClient.set(`pwd_reset_otp:${email}`, otp, {
    EX: ttl,
  });
};


export const getPasswordResetOtp = async (email) => {
  return await redisClient.get(`pwd_reset_otp:${email}`);
};


export const deletePasswordResetOtp = async (email) => {
  await redisClient.del(`pwd_reset_otp:${email}`);
};