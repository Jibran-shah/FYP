export class AppError extends Error {
  constructor({
    message,
    statusCode = 500,
    errorCode = "INTERNAL_SERVER_ERROR",
    isOperational = true,
    details = null
  }) {
    super(message);

    this.name = this.constructor.name;

    this.statusCode = statusCode;

    this.errorCode = errorCode;

    this.isOperational = isOperational;

    this.details = details;

    this.timestamp = new Date().toISOString();

    Error.captureStackTrace(this, this.constructor);
  }
}
