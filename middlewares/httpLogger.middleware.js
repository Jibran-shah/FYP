import morgan from "morgan";
import { logger } from "../config/logger.js";

const stream = {
  write: (message) => logger.http(message.trim()),
};

export const httpLogger = morgan(
  ":method :url :status :response-time ms",
  { stream }
);