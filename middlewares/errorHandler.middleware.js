import {
  AppError,
  ValidationError,
  ConflictError,
  DatabaseError,
} from "../errors/index.js";
import { logger } from "../config/logger.js";

export const errorHandler = (err, req, res, next) => {

  logger.error(err.stack);
  
  let error = err;

  /*
  ============================================
  1. HANDLE MONGOOSE VALIDATION ERROR
  ============================================
  */
  if (err.name === "ValidationError" && !(err instanceof AppError)) {
    const errors = err.errors
      ? Object.values(err.errors).map((e) => ({
          field: e.path,
          message: e.message,
        }))
      : [];

    error = new ValidationError("Validation failed", errors);
  }

  /*
  ============================================
  2. HANDLE INVALID OBJECT ID
  ============================================
  */
  else if (err.name === "CastError") {
    error = new ValidationError(`Invalid ${err.path}: ${err.value}`, [
      {
        field: err.path,
        message: `Invalid value "${err.value}"`,
      },
    ]);
  }

  /*
  ============================================
  3. HANDLE DUPLICATE KEY (UNIQUE)
  ============================================
  */
  else if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];

    error = new ConflictError(`${field} already exists`, [
      {
        field,
        message: `${field} must be unique`,
      },
    ]);
  }

  /*
  ============================================
  4. HANDLE DATABASE CONNECTION ERRORS
  ============================================
  */
  else if (err.name === "MongoNetworkError") {
    error = new DatabaseError("Database connection failed");
  }

  /*
  ============================================
  5. HANDLE UNKNOWN ERRORS
  ============================================
  */
  if (!(error instanceof AppError)) {
    error = new AppError({
      message: err.message || "Internal Server Error",
      statusCode: 500,
      errorCode: "INTERNAL_SERVER_ERROR",
      isOperational: false,
    });
  }

  /*
  ============================================
  6. BUILD RESPONSE
  ============================================
  */
  const response = {
    success: false,
    error: {
      message: error.message,
      code: error.errorCode,
      statusCode: error.statusCode,
      timestamp: error.timestamp,
    },
  };

  /*
  ============================================
  7. ATTACH VALIDATION DETAILS (IMPORTANT)
  ============================================
  */
  if (error.details) {
    response.error.details = error.details;
  }

  /*
  ============================================
  8. ATTACH STACK (ONLY IN DEV)
  ============================================
  */
  if (process.env.NODE_ENV === "development") {
    response.error.stack = err.stack;
  }

  /*
  ============================================
  9. SEND RESPONSE
  ============================================
  */
  res.status(error.statusCode).json(response);
};