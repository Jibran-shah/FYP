import { redisClient } from "../config/redis.js";
import { BadRequestError } from "../errors/index.js";

const verifyEmailkey = (userId)=>`email:verify:${userId}`;

export const setEmailVerificationToken = async (userId, token, ttl = 1800) => 
  await redisClient.set(verifyEmailkey(userId), token, "EX", ttl);

export const getEmailVerificationToken = async (userId) => 
  await redisClient.get(verifyEmailkey(userId));


export const deleteEmailVerificationToken = async (userId) => await redisClient.del(verifyEmailkey(userId));

const verifyEmailCooldownKey = (userId) => `email:verify:cooldown:${userId}`;

/**
 * Block spam resend requests
 */
export const checkEmailVerificationCooldown = async (userId) => {
  const exists = await redisClient.get(verifyEmailCooldownKey(userId));

  if (exists) {
    const err = new Error("Please wait before requesting another verification email");
    err.statusCode = 429;
    throw err;
  }
};


export const setEmailVerificationCooldown = async (userId, seconds = 60) => 
  await redisClient.set(verifyEmailCooldownKey(userId), "1", "EX", seconds);




export const assertEmailVerified = (user) => {
  if (!user.isEmailVerified) {
    throw new BadRequestError("Please verify your email before logging in",{
      userId:user._id
    });
  }
};