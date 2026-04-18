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




export const EMAIL_STATUS_TYPES = {
  PENDING: "pending",
  SENT: "sent",
  FAILED: "failed"
};


export const EMAIL_STATUS_TYPES_ARRAY = [EMAIL_STATUS_TYPES.PENDING, EMAIL_STATUS_TYPES.SENT, EMAIL_STATUS_TYPES.FAILED];