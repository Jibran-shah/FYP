// src/errors/DatabaseError.js

import { AppError } from "./App.error.js";

export class DatabaseError extends AppError {
  constructor(message = "Database error", details = null) {
    super({
      message,
      statusCode: 500,
      errorCode: "DATABASE_ERROR",
      isOperational: true,
      details
    });
  }
}
