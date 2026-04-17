import { AppError } from "./App.error.js";

export class RedisError extends AppError {
  constructor({
    message = "Redis operation failed",
    operation = null,
    key = null,
    cause = null,
    statusCode = 500,
  } = {}) {
    super({
      message,
      statusCode,
      errorCode: "REDIS_ERROR",
      isOperational: true,
      details: {
        operation,
        key,
        cause: cause
          ? {
              message: cause.message,
              name: cause.name,
            }
          : null,
      },
    });

    this.name = "RedisError";

    // preserve real stack trace INCLUDING where Redis failed
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, RedisError);
    }
  }
}



export const RedisOpError = (operation, key, cause) =>
  new RedisError({
    message: `Redis ${operation} failed`,
    operation,
    key,
    cause,
  });