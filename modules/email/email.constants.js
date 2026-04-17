import {EMAIL_CONFIG} from "../../config/email.config.js"

export const EMAIL_QUEUE_NAME = EMAIL_CONFIG.QUEUE.NAME;

// ----------------------
// JOB TYPES
// ----------------------
export const EMAIL_JOB_TYPES = {
  SEND_EMAIL: "send-email"
};

// ----------------------
// QUEUE OPTIONS
// ----------------------
export const EMAIL_QUEUE_OPTIONS = {
  defaultJobOptions: {
    attempts: EMAIL_CONFIG.Job.ATTEMPTS,

    backoff: EMAIL_CONFIG.Job.BACKOFF,

    removeOnComplete: EMAIL_CONFIG.RETENTION.COMPLETED,

    removeOnFail: EMAIL_CONFIG.RETENTION.FAILED
  }
};

// ----------------------
// EMAIL TYPES
// ----------------------
export const EMAIL_TYPES = {
  VERIFY_EMAIL: "verify-email",
  FORGOT_PASSWORD: "forgot-password",
  CUSTOM: "custom"
};


export const email_log_status_array = ["pending", "sent", "failed"];

export const EMAIL_LOG_STATUS_TYPES = {
  PENDING: email_log_status_array[0],
  SENT: email_log_status_array[1],
  FAILED: email_log_status_array[2]
};