// email.constants.js

export const EMAIL_QUEUE_NAME = "email-queue";

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
    attempts: 5,

    backoff: {
      type: "exponential",
      delay: 2000
    },

    removeOnComplete: {
      age: 3600,   // keep completed jobs for 1 hour (debugging)
      count: 1000  // max 1000 jobs
    },

    removeOnFail: {
      age: 86400,  // keep failed jobs for 24 hours
      count: 5000
    }
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