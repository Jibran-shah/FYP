import { AppError } from "./App.error.js";

export class OtpTooManyAttemptsError extends AppError {
  constructor(details = null) {
    super({
      message: "Too many OTP attempts. Try again later.",
      statusCode: 429,
      errorCode: "OTP_ATTEMPTS_EXCEEDED",
      isOperational: true,
      details,
    });

    this.name = "OtpTooManyAttemptsError";
  }
}

export class OtpRequestLimitError extends AppError {
  constructor(details = null) {
    super({
      message: "Too many OTP requests. Try again later.",
      statusCode: 429,
      errorCode: "OTP_REQUEST_LIMIT_EXCEEDED",
      isOperational: true,
      details,
    });

    this.name = "OtpRequestLimitError";
  }
}