export const AUTH_CONFIG = {
  ACCESS_TOKEN: {
    EXPIRY: process.env.JWT_ACCESS_EXPIRES || "15m",
    COOKIE_NAME: "accessToken",
  },

  REFRESH_TOKEN: {
    EXPIRY: process.env.JWT_REFRESH_EXPIRES || "7d",
    COOKIE_NAME: "refreshToken",
  },

  RESET_TOKEN: {
    EXPIRY: process.env.JWT_RESET_EXPIRES || "1m",
    COOKIE_NAME: "resetToken",
  },

  OTP: {
    TTL_SECONDS: Number(process.env.OTP_TTL || 300),
    MAX_ATTEMPTS: Number(process.env.OTP_MAX_ATTEMPTS || 5),
    ATTEMPT_WINDOW_SECONDS: Number(process.env.OTP_ATTEMPT_WINDOW || 300),
    REQUEST_LIMIT: Number(process.env.OTP_REQUEST_LIMIT || 3),
    REQUEST_WINDOW_SECONDS: Number(process.env.OTP_REQUEST_WINDOW || 600),
  },

  EMAIL_VERIFY: {
    TTL_SECONDS: Number(process.env.EMAIL_VERIFY_TTL || 1800),
    COOLDOWN_SECONDS: Number(process.env.EMAIL_VERIFY_COOLDOWN || 60),
  },

  RESET_PASSWORD: {
    TTL_SECONDS: Number(process.env.RESET_TOKEN_TTL || 900),
  },

  BCRYPT: {
    SALT_ROUNDS: Number(process.env.BCRYPT_SALT_ROUNDS || 12),
  },
};