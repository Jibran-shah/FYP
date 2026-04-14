import { createEmailLog } from "./emailLog.service.js";
// =========================
// 📊 LOGGING
// =========================

export const createLog = async ({ to, type, subject, data, job }) => {
  return await createEmailLog({
    to,
    type,
    subject,
    meta: {
      ...data,
      jobId: job.id,
      attempt: job.attemptsMade,
      maxAttempts: job.opts?.attempts
    }
  });
};
