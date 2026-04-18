import {
  buildKey,
  storeHashed,
  verifyHashed,
  deleteKey,
  incrementWithTTL,
  getOrNull
} from "./redis.utils.js";

import {
  OtpTooManyAttemptsError,
  OtpRequestLimitError,
} from "../errors/Otp.error.js";

import { normalizeUserId } from "./user.utils.js";
import { otpConfig } from "./config.utils.js";

const PREFIX = {
  otp: "auth:otp",
  attempts: "auth:otp_attempts",
  requests: "auth:otp_req",
};

const key = (type, userId) =>
  buildKey(PREFIX[type], normalizeUserId(userId));

/* ================= OTP ================= */

export const setOtp = async (userId, otp) => {
  const { ttl } = otpConfig();

  await storeHashed({
    key: key("otp", userId),
    value: otp,
    ttl,
  });
};

export const verifyOtp = (userId, otp) =>
  verifyHashed({
    key: key("otp", userId),
    value: otp,
  });

export const deleteOtp = (userId) =>
  deleteKey(key("otp", userId));

/* ================= ATTEMPTS ================= */

export const checkOtpAttempts = async (userId) => {
  const { maxAttempts } = otpConfig();

  const count = parseInt(await getOrNull(key("attempts", userId)) || "0");

  if (count >= maxAttempts) {
    throw new OtpTooManyAttemptsError({ userId, count });
  }
};

export const increaseOtpAttempts = (userId) => {
  const { attemptWindow } = otpConfig();
  return incrementWithTTL(key("attempts", userId), attemptWindow);
};

export const resetOtpAttempts = (userId) =>
  deleteKey(key("attempts", userId));

/* ================= REQUEST LIMIT ================= */

export const checkOtpRequestLimit = async (userId) => {
  const { requestLimit, requestWindow } = otpConfig();

  const count = await incrementWithTTL(
    key("requests", userId),
    requestWindow
  );

  if (count > requestLimit) {
    throw new OtpRequestLimitError({ userId, count });
  }

  return count;
};


export const generateOtp = ()=>{
  return Math.floor(100000 + Math.random() * 900000).toString()
}