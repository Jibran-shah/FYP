import { AUTH_CONFIG } from "../config/auth.config.js";

/* ================= OTP ================= */

export const otpConfig = () => ({
  ttl: AUTH_CONFIG.OTP.TTL_SECONDS,
  maxAttempts: AUTH_CONFIG.OTP.MAX_ATTEMPTS,
  attemptWindow: AUTH_CONFIG.OTP.ATTEMPT_WINDOW_SECONDS,
  requestLimit: AUTH_CONFIG.OTP.REQUEST_LIMIT,
  requestWindow: AUTH_CONFIG.OTP.REQUEST_WINDOW_SECONDS,
});

/* ================= EMAIL ================= */

export const emailConfig = () => ({
  verifyTTL: AUTH_CONFIG.EMAIL_VERIFY.TTL_SECONDS,
  cooldown: AUTH_CONFIG.EMAIL_VERIFY.COOLDOWN_SECONDS,
});

/* ================= TOKENS ================= */

export const tokenConfig = () => ({
  access: {
    expiry: AUTH_CONFIG.ACCESS_TOKEN.EXPIRY,
    cookieName: AUTH_CONFIG.ACCESS_TOKEN.COOKIE_NAME,
  },
  refresh: {
    expiry: AUTH_CONFIG.REFRESH_TOKEN.EXPIRY,
    cookieName: AUTH_CONFIG.REFRESH_TOKEN.COOKIE_NAME,
  },
  reset: {
    expiry: AUTH_CONFIG.RESET_TOKEN.EXPIRY,
    cookieName: AUTH_CONFIG.RESET_TOKEN.COOKIE_NAME,
    ttl: AUTH_CONFIG.RESET_PASSWORD.TTL_SECONDS,
  },
});

/* ================= BCRYPT ================= */

export const bcryptConfig = () => ({
  saltRounds: AUTH_CONFIG.BCRYPT.SALT_ROUNDS,
});