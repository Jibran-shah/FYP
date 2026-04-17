import jwt from "jsonwebtoken";
import crypto from "crypto";

import {
  InternalServerError,
  InvalidTokenError,
  TokenExpiredError,
} from "../errors/index.js";

import {
  buildKey,
  storeHashed,
  verifyHashed,
  deleteKey
} from "./redis.utils.js";

import { normalizeUserId } from "./user.utils.js";
import { otpConfig, tokenConfig } from "./config.utils.js";

/* ================= CONFIG ================= */

const { access, refresh, reset } = tokenConfig();
const otpConfigObj = otpConfig();

/* ================= AUTH TOKENS ================= */

export const generateAccessToken = (userId, role, profileStatus) => {
  if (!process.env.JWT_ACCESS_SECRET)
    throw new InternalServerError("JWT_ACCESS_SECRET not configured");

  if (!userId)
    throw new InternalServerError("userId required");

  return jwt.sign(
    { userId, role, profileStatus },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn:  access.expiry}
  );
};

export const generateRefreshToken = (
  userId,
  role,
  sessionId,
  profileStatus
) => {
  if (!process.env.JWT_REFRESH_SECRET)
    throw new InternalServerError("JWT_REFRESH_SECRET not configured");

  if (!userId)
    throw new InternalServerError("userId required");

  return jwt.sign(
    { userId, role, sessionId, profileStatus },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: refresh.expiry }
  );
};

/* ================= VERIFY ================= */

export const verifyAccessToken = (token) => {
  if (!token)
    throw new InvalidTokenError("Access token missing");

  try {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  } catch (err) {
    if (err.name === "TokenExpiredError")
      throw new TokenExpiredError("Access token expired");

    throw new InvalidTokenError("Invalid access token");
  }
};

export const verifyRefreshToken = (token) => {
  if (!token)
    throw new InvalidTokenError("Refresh token missing");

  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (err) {
    if (err.name === "TokenExpiredError")
      throw new TokenExpiredError("Refresh token expired");

    throw new InvalidTokenError("Invalid refresh token");
  }
};

/* ================= JWT RESET TOKEN ================= */

export const generateResetToken = (userId, email) => {
  if (!process.env.JWT_RESET_SECRET)
    throw new InternalServerError("JWT_RESET_SECRET not configured");

  const jti = crypto.randomBytes(16).toString("hex");

  const token = jwt.sign(
    { userId, email, jti, type: "PASSWORD_RESET" },
    process.env.JWT_RESET_SECRET,
    { expiresIn: reset.expiry }
  );

  return { token, jti };
};

export const verifyResetToken = (token) => {
  if (!token) throw new InvalidTokenError("Reset token missing");

  try {
    const decoded = jwt.verify(token, process.env.JWT_RESET_SECRET);

    if (!decoded?.userId || decoded.type !== "PASSWORD_RESET") {
      throw new InvalidTokenError("Invalid reset token");
    }

    return decoded;
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      throw new TokenExpiredError("Reset token expired");
    }

    throw new InvalidTokenError("Invalid reset token");
  }
};

/* ================= REDIS RESET TOKEN ================= */

const resetTokenKey = (userId) =>
  buildKey("auth:pwd_reset_token", normalizeUserId(userId));

export const storeResetToken = async (userId, token, ttl = parseExpiresToSeconds(reset.expiry)) => {
  await storeHashed({
    key: resetTokenKey(userId),
    value: token,
    ttl,
  });
};

export const verifyStoredResetToken = (userId, token) =>
  verifyHashed({
    key: resetTokenKey(userId),
    value: token,
  });

export const deleteResetToken = (userId) =>
  deleteKey(resetTokenKey(userId));

/* ================= RESET OTP ================= */

const resetOtpKey = (userId) =>
  buildKey("auth:pwd_reset_otp", normalizeUserId(userId));

export const setPasswordResetOtp = async (userId, otp, ttl = otpConfigObj.ttl) => {
  await storeHashed({
    key: resetOtpKey(userId),
    value: otp,
    ttl,
  });
};

export const verifyPasswordResetOtp = (userId, otp) =>
  verifyHashed({
    key: resetOtpKey(userId),
    value: otp,
  });

export const deletePasswordResetOtp = (userId) =>
  deleteKey(resetOtpKey(userId));

/* ================= UTILS ================= */

export const parseExpiresToSeconds = (expires) => {
  if (!expires) {
    throw new InternalServerError("expiration value is missing");
  }

  const num = parseInt(expires);

  if (isNaN(num)) {
    throw new InternalServerError("Invalid expiration format");
  }

  if (expires.endsWith("d")) return num * 86400;
  if (expires.endsWith("h")) return num * 3600;
  if (expires.endsWith("m")) return num * 60;
  if (expires.endsWith("s")) return num;

  return num;
};