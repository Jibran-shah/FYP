import { SecretStore } from "./secretStore.utils.js";
import { CounterStore } from "./counterStore.utils.js";

import {
  OtpTooManyAttemptsError,
  OtpRequestLimitError,
} from "../errors/Otp.error.js";

import { normalizeUserId } from "./user.utils.js";
import { AUTH_CONFIG } from "../config/auth.config.js";


export const otpStore = new SecretStore({
  prefix: "auth:otp",
  ttl: AUTH_CONFIG.OTP.TTL_SECONDS,
  hash: true
});

export const otpAttempts = new CounterStore({
  prefix: "auth:otp_attempts",
  ttl: AUTH_CONFIG.OTP.ATTEMPT_WINDOW_SECONDS
});

export const otpRequests = new CounterStore({
  prefix: "auth:otp_req",
  ttl: AUTH_CONFIG.OTP.REQUEST_WINDOW_SECONDS
});


export const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();