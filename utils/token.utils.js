import jwt from "jsonwebtoken";
import crypto from "crypto";

import {
  InternalServerError,
  InvalidTokenError,
  TokenExpiredError,
} from "../errors/index.js";

import {
  buildKey,
  deleteKey
} from "./redis.utils.js";
import { normalizeUserId } from "./user.utils.js";
import { AUTH_CONFIG } from "../config/auth.config.js";

import { TokenSystem } from "./TokenSystem.utils.js";
import { SecretStore } from "./secretStore.utils.js";



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


export const generateToken = ()=> crypto.randomBytes(32).toString("hex");


export const accessTokenSystem = new TokenSystem({
  secret: process.env.JWT_ACCESS_SECRET,
  expiresIn: AUTH_CONFIG.ACCESS_TOKEN.EXPIRY,
});


export const refreshTokenSystem = new TokenSystem({
  secret: process.env.JWT_REFRESH_SECRET,
  expiresIn: AUTH_CONFIG.REFRESH_TOKEN.EXPIRY,
  includeJti: true,
});



export const resetTokenSystem = new TokenSystem({
  secret: process.env.JWT_RESET_SECRET,
  expiresIn: AUTH_CONFIG.RESET_TOKEN.EXPIRY,
  type: "PASSWORD_RESET",
  includeJti: true,
});

/* ================= ACCESS TOKEN ================= */

export const generateAccessToken = ({
  user
}) => {
  return accessTokenSystem.generate({
        userId:user._id,
        role:user.role,
        baseProfile:user.baseProfile,
        productSeller:user.productSeller,
        serviceProvider:user.serviceProvider,
      });
};


export const generateRefreshToken = ({
  user,
  sessionId,
}) => {
  return refreshTokenSystem.generate({
        userId:user._id,
        sessionId,
        role:user.role,
        baseProfile:user.baseProfile,
        productSeller:user.productSeller,
        serviceProvider:user.serviceProvider,
      });
};

/* ================= VERIFY TOKENS ================= */

export const verifyAccessToken = (token) => {
  return accessTokenSystem.verify(token);
};

export const verifyRefreshToken = (token) => {
  return refreshTokenSystem.verify(token);
}

/* ================= RESET TOKEN ================= */

export const generateResetToken = (userId, email) => {
   return resetTokenSystem.generate({
    userId,
    email,
  });
};

export const verifyResetToken = (token) => {
  return resetTokenSystem.verify(token);
};

/* ================= STORES ================= */

export const resetTokenStore = new SecretStore({
  prefix: `auth:pwd_reset_token${AUTH_CONFIG.RESET_TOKEN.COOKIE_NAME}`,
  ttl: parseExpiresToSeconds(AUTH_CONFIG.RESET_TOKEN.EXPIRY),
  hash: true,
});

export const resetOtpStore = new SecretStore({
  prefix: "auth:pwd_reset_otp",
  ttl: AUTH_CONFIG.OTP.TTL_SECONDS,
  hash: true,
});



