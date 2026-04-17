export const EMAIL_CONFIG = {
  QUEUE: {
    NAME: process.env.EMAIL_QUEUE_NAME || "email-queue",
  },

    Job: {
        ATTEMPTS: Number(process.env.EMAIL_JOB_ATTEMPTS || 5),

        BACKOFF: {
            type: process.env.EMAIL_JOB_BACKOFF_TYPE || "exponential",
            delay: Number(process.env.EMAIL_JOB_BACKOFF_DELAY || 2000),
        },
    },

  RETENTION: {
    COMPLETED: {
        age: Number(process.env.EMAIL_JOB_REMOVE_COMPLETE_AGE || 3600),
        count: Number(process.env.EMAIL_JOB_REMOVE_COMPLETE_COUNT || 1000),
    },

    FAILED: {
        age: Number(process.env.EMAIL_JOB_REMOVE_FAIL_AGE || 86400),
        count: Number(process.env.EMAIL_JOB_REMOVE_FAIL_COUNT || 5000),
        },
    },
    SMTP: {
    HOST: process.env.SMTP_HOST,
    PORT: Number(process.env.SMTP_PORT || 587),
    USER: process.env.SMTP_USER,
    PASS: process.env.SMTP_PASS,

    FROM: {
      EMAIL: process.env.EMAIL_FROM,
      NAME: process.env.EMAIL_FROM_NAME || "App",
    },

    SECURE: Number(process.env.SMTP_PORT) === 465,

    // =====================================================
    // 🔗 CONNECTION POOL SETTINGS
    // =====================================================
    POOL: {
      ENABLED: process.env.SMTP_POOL_ENABLED === "true",
      MAX_CONNECTIONS: Number(process.env.SMTP_MAX_CONNECTIONS || 5),
      MAX_MESSAGES: Number(process.env.SMTP_MAX_MESSAGES || 100),

      RATE_DELTA_MS: Number(process.env.SMTP_RATE_DELTA_MS || 1000),
      RATE_LIMIT: Number(process.env.SMTP_RATE_LIMIT || 10),
    },
  },

}
