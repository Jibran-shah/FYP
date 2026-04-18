import { BadRequestError } from "../errors/index.js";
import {
  setWithTTL,
  getOrNull,
  deleteKey,
} from "./redis.utils.js";
import { emailConfig } from "./config.utils.js";
export const assertEmailVerified = (user) => {
  if (!user.isEmailVerified) {
    throw new BadRequestError("Please verify your email before logging in",{
      userId:user._id
    });
  }
};


const key = {
  verify: (id) => `email:verify:${id}`,
  cooldown: (id) => `email:verify:cooldown:${id}`,
};

export const setEmailVerificationToken = async (userId, token) => {
  const { verifyTTL } = emailConfig();
  return setWithTTL(key.verify(userId), token, verifyTTL);
};

export const getEmailVerificationToken = (userId) =>
  getOrNull(key.verify(userId));

export const deleteEmailVerificationToken = (userId) =>
  deleteKey(key.verify(userId));

export const checkEmailVerificationCooldown = async (userId) => {
  const exists = await getOrNull(key.cooldown(userId));

  if (exists) {
    throw new BadRequestError(
      "Please wait before requesting another verification email"
    );
  }
};

export const setEmailVerificationCooldown = async (userId) => {
  const { cooldown } = emailConfig();
  return setWithTTL(key.cooldown(userId), "1", cooldown);
};

export const generateToken = ()=>crypto.randomBytes(32).toString("hex");

export const generateVerificationLink = (userId,token)=>{
  return `${process.env.FRONTEND_URL}/api/auth/verify-email?userId=${userId}&token=${token}`
}