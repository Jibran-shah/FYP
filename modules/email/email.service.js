import { addEmailJob } from "./email.queue.helper.js";
import { EMAIL_TYPES } from "./email.constants.js";
import { emailRateLimiter } from "./email.ratelimiter.js";

class EmailService {
  async send({ type, to, data, userId }, options = {}) {
    if (!type) throw new Error("Email type is required");
    if (!to) throw new Error("Recipient email is required");

    const identifier = userId || to.toLowerCase().trim();

    try {
        await emailRateLimiter({
          key: `email:${identifier}:${type}`,
          limit: 5,
          windowSec: 3600
        });
      } catch (err) {
        console.warn("⚠️ Rate limiter failed:", err.message);
      }

    return addEmailJob({ type, to, data }, options);
  }

  async sendVerificationEmail({ to, name, link, userId }) {
    return this.send({
      type: EMAIL_TYPES.VERIFY_EMAIL,
      to,
      userId,
      data: { name, link }
    });
  }

  async sendForgotPasswordEmail({ to, otp, userName, userId }) {
    return this.send({
      type: EMAIL_TYPES.FORGOT_PASSWORD,
      to,
      userId,
      data: { otp, userName }
    });
  }

  async sendCustom({ to, subject, html, userId }) {
    return this.send({
      type: EMAIL_TYPES.CUSTOM,
      to,
      userId,
      data: { subject, html }
    });
  }
}

// Singleton (important)
export const emailService = new EmailService();