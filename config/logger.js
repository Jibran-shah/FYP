import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

const { combine, timestamp, printf, colorize, json } = winston.format;

const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

// File transport (rotating logs)
const fileTransport = new DailyRotateFile({
  filename: "logs/%DATE%-app.log",
  datePattern: "YYYY-MM-DD",
  maxSize: "20m",
  maxFiles: "14d",
});

// Console transport
const consoleTransport = new winston.transports.Console({
  format: combine(colorize(), logFormat),
});

export const logger = winston.createLogger({
  level: "debug",
  format: combine(timestamp(), json()),
  transports: [fileTransport, consoleTransport],
});