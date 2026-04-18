import rateLimit from "express-rate-limit";
import {GLOBAL_RATE_LIMITOR} from "./config/rateLimitors.config.js"

export const globalRateLimiter = rateLimit({
  windowMs: GLOBAL_RATE_LIMITOR.WINDOW_MS,
  max:GLOBAL_RATE_LIMITOR.MAX,
  message:GLOBAL_RATE_LIMITOR.MESSAGE
});
