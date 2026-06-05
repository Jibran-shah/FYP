import jwt from "jsonwebtoken";
import crypto from "crypto";

import {
  InternalServerError,
  InvalidTokenError,
  TokenExpiredError,
} from "../errors/index.js";

export class TokenSystem {
  constructor({
    secret,
    expiresIn,
    type = null,
    includeJti = false,
    audience = null,
    issuer = null,
  }) {
    if (!secret) {
      throw new InternalServerError("JWT secret is required");
    }

    this.secret = secret;
    this.expiresIn = expiresIn;
    this.type = type;
    this.includeJti = includeJti;
    this.audience = audience;
    this.issuer = issuer;
  }

  generate(payload = {}) {
    if (!payload || typeof payload !== "object") {
      throw new InternalServerError("Payload required for token generation");
    }

    const finalPayload = { ...payload };

    if (this.type) {
      finalPayload.type = this.type;
    }

    if (this.includeJti) {
      finalPayload.jti = crypto.randomBytes(16).toString("hex");
    }

    const options = {
      expiresIn: this.expiresIn,
    };

    if (this.audience) options.audience = this.audience;
    if (this.issuer) options.issuer = this.issuer;

    return jwt.sign(finalPayload, this.secret, options);
  }

  verify(token) {
    if (!token) {
      throw new InvalidTokenError("Token missing");
    }

    try {
      const options = {};

      if (this.audience) options.audience = this.audience;
      if (this.issuer) options.issuer = this.issuer;

      const decoded = jwt.verify(token, this.secret, options);

      if (this.type && decoded.type !== this.type) {
        throw new InvalidTokenError("Invalid token type");
      }

      return decoded;
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        throw new TokenExpiredError("Token expired");
      }
      throw new InvalidTokenError("Invalid token");
    }
  }
}