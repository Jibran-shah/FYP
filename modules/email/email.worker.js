import { Worker } from "bullmq";
import { redisConnection } from "../../config/redis.js";
import { EMAIL_QUEUE_NAME } from "./email.constants.js";
import { emailProcessor } from "./email.processor.js";

export const emailWorker = new Worker(
  EMAIL_QUEUE_NAME,
  async (job) => {
    console.log("🔥 Job received:", job.id);
    return emailProcessor(job);
  },
  {
    connection: redisConnection,
    concurrency: 5
  }
);

emailWorker.on("completed", (job) => {
  console.log("✅ Email sent:", job.id);
});

emailWorker.on("failed", (job, err) => {
  console.error("❌ Failed:", job?.id, err.message);
});