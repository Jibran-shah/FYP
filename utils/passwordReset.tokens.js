import jwt from "jsonwebtoken";
import { InternalServerError } from "../errors/index.js";
import {
  InvalidTokenError,
  TokenExpiredError,
} from "../errors/index.js";


export const generateResetToken = (userId, email) => {
  if (!process.env.JWT_RESET_SECRET)
    throw new InternalServerError("JWT_RESET_SECRET not configured");

  return jwt.sign(
    { userId, email, type: "PASSWORD_RESET" },
      process.env.JWT_RESET_SECRET,
    {
      expiresIn: process.env.JWT_RESET_EXPIRES || "10m",
    }
  );
};



export const verifyResetToken = (token) => {
  if (!token)
    throw new InvalidTokenError("Reset token missing");

  try {
    const secret = process.env.JWT_RESET_SECRET;

    const decoded = jwt.verify(token, secret);

    if (decoded.type !== "PASSWORD_RESET") {
      throw new InvalidTokenError("Invalid reset token type");
    }

    return decoded;
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      throw new TokenExpiredError("Reset token expired");
    }

    if (err.name === "JsonWebTokenError") {
      throw new InvalidTokenError("Invalid reset token");
    }

    throw new InvalidTokenError("Reset token verification failed");
  }
};