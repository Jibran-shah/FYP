import { logger } from "../config/logger.js";

export const logEvent = (event, data = {}) => {
  logger.info({
    event,
    ...data,
  });
};