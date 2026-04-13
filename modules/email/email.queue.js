import { Queue } from "bullmq";
import { redisConnection } from "../../config/redis.js";
import { EMAIL_QUEUE_NAME, EMAIL_QUEUE_OPTIONS } from "./email.constants.js";

export const emailQueue = new Queue(EMAIL_QUEUE_NAME, {
  connection: redisConnection,
  defaultJobOptions: EMAIL_QUEUE_OPTIONS.defaultJobOptions
});