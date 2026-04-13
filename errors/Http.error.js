import { AppError } from "./App.error.js";

export class HttpError extends AppError {
  constructor({
    message,
    statusCode,
    errorCode,
    details
  }) {
    super({
      message,
      statusCode,
      errorCode,
      isOperational: true,
      details
    });
  }
}


export class BadRequestError extends HttpError {
  constructor(message = "Bad request", details = null) {
    super({
      message,
      statusCode: 400,
      errorCode: "BAD_REQUEST",
      details
    });
  }
}


export class ConflictError extends HttpError {
  constructor(message = "Conflict", details = null) {
    super({
      message,
      statusCode: 409,
      errorCode: "CONFLICT",
      details
    });
  }
}


export class ForbiddenError extends HttpError {
  constructor(message = "Forbidden", details = null) {
    super({
      message,
      statusCode: 403,
      errorCode: "FORBIDDEN",
      details
    });
  }
}


export class InternalServerError extends HttpError {
  constructor(message = "Internal server error") {
    super({
      message,
      statusCode: 500,
      errorCode: "INTERNAL_SERVER_ERROR"
    });
  }
}


export class UnauthorizedError extends HttpError {
  constructor(message = "Unauthorized", details = null) {
    super({
      message,
      statusCode: 401,
      errorCode: "UNAUTHORIZED",
      details
    });
  }
}


export class InvalidTokenError extends UnauthorizedError {
  constructor() {
    super("Invalid token");
    this.errorCode = "INVALID_TOKEN";
  }
}


export class TokenExpiredError extends UnauthorizedError {
  constructor() {
    super("Token expired");
    this.errorCode = "TOKEN_EXPIRED";
  }
}

export class NotFoundError extends HttpError {
  constructor(resource = "Resource") {
    super({
      message: `${resource} not found`,
      statusCode: 404,
      errorCode: "NOT_FOUND"
    });
  }
}

export class ServiceUnavailableError extends HttpError {
  constructor(message = "Service unavailable") {
    super({
      message,
      statusCode: 503,
      errorCode: "SERVICE_UNAVAILABLE"
    });
  }
}


export class TooManyRequestsError extends HttpError {
  constructor(message = "Too many requests") {
    super({
      message,
      statusCode: 429,
      errorCode: "TOO_MANY_REQUESTS"
    });
  }
}


export class ValidationError extends HttpError {
  constructor(message = "Validation failed", details = null) {
    super({
      message,
      statusCode: 422,
      errorCode: "VALIDATION_ERROR",
      details
    });
  }
}
