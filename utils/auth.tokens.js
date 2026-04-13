import jwt from "jsonwebtoken";
import {
  InvalidTokenError,
  TokenExpiredError,InternalServerError
} from "../errors/index.js";


export const generateAccessToken =
  (userId, role, profileStatus) => {

    if (!process.env.JWT_ACCESS_SECRET)
      throw new Error("JWT_ACCESS_SECRET not configured");

    if (!userId)
      throw new Error("userId required for token");

    return jwt.sign(
      { userId, role, profileStatus },
      process.env.JWT_ACCESS_SECRET,
      {
        expiresIn:
          process.env.JWT_ACCESS_EXPIRES || "15m",
      }
    );
};


export const generateRefreshToken =
  (userId, role, sessionId, profileStatus) => {

    if (!process.env.JWT_REFRESH_SECRET)
      throw new Error("JWT_REFRESH_SECRET not configured");

    if (!userId)
      throw new Error("userId required for token");

    return jwt.sign(
      { userId, role, sessionId, profileStatus },
      process.env.JWT_REFRESH_SECRET,
      {
        expiresIn:
          process.env.JWT_REFRESH_EXPIRES || "15m",
      }
    );
};

export const verifyAccessToken = (token) => {

  if (!token)
    throw new InvalidTokenError("Access token missing");

  try {

    const secret =
      process.env.JWT_ACCESS_SECRET;

    return jwt.verify(token, secret);

  } catch (err) {

    if (err.name === "TokenExpiredError")
      throw new TokenExpiredError("Access token expired");

    if (err.name === "JsonWebTokenError")
      throw new InvalidTokenError("Invalid access token");

    if (err.name === "NotBeforeError")
      throw new InvalidTokenError("Token not active");

    throw new InvalidTokenError("Token verification failed");

  }
};


/**
 * Verify refresh token
 * @param {string} token
 * @returns {object} payload
 */
export const verifyRefreshToken = (token) => {

  if (!token)
    throw new InvalidTokenError("Refresh token missing");

  try {

    const secret =
      process.env.JWT_REFRESH_SECRET;

    return jwt.verify(token, secret);

  } catch (err) {

    if (err.name === "TokenExpiredError") {
      throw new TokenExpiredError("Refresh token expired");
    }

    if (err.name === "JsonWebTokenError") {
      throw new InvalidTokenError("Invalid refresh token");
    }

    if (err.name === "NotBeforeError") {
      throw new InvalidTokenError("Token not active");
    }

    throw new InvalidTokenError("Token verification failed");

  }
};

export const parseExpiresToSeconds =
  (expires) => {

    if (!expires)
      throw new InternalServerError(
        "Expiration value missing"
      );

    const num = parseInt(expires);

    if (isNaN(num))
      throw new InternalServerError(
        "Invalid expiration format"
      );

    if (expires.endsWith("d"))
      return num * 86400;

    if (expires.endsWith("h"))
      return num * 3600;

    if (expires.endsWith("m"))
      return num * 60;

    if (expires.endsWith("s"))
      return num;

    return num;
};

