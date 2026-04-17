import { Worker } from "bullmq";
import { redisConnection } from "../../config/redis.js";
import { EMAIL_QUEUE_NAME } from "./email.constants.js";
import { emailProcessor } from "./email.processor.js";
import { logger } from "../../config/logger.js";

export const emailWorker = new Worker(
  EMAIL_QUEUE_NAME,
  async (job) => {
    logger.info("🔥 Job received:", {jobId:job.id});
    return emailProcessor(job);
  },
  {
    connection: redisConnection,
    concurrency: 5
  }
);

emailWorker.on("completed", (job) => {
  logger.info("✅ Email sent:", {jobId:job.id});
});

emailWorker.on("failed", (job, err) => {
  logger.error("❌ Failed:", {jobId:job?.id,error:{ message:err.message,
    details:err.stack
  }});
});