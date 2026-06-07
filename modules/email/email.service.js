import { addEmailJob } from "./email.queue.helper.js";
import { EMAIL_TYPES } from "./email.constants.js";
import { emailRateLimiter } from "./email.ratelimiter.js";
import { emailVerificationStore, generateVerificationLink } from "../../utils/email.utils.js";
import { generateOtp, otpRequests, otpStore } from "../../utils/otp.utils.js";
import { AUTH_CONFIG } from "../../config/auth.config.js";
import { generateToken } from "../../utils/token.utils.js";
import { OtpRequestLimitError } from "../../errors/Otp.error.js";

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

  async sendVerificationEmail({ to, name, userId }) {
    const active = await emailVerificationStore.hasCooldown(userId);
    if (active) {
      throw new BadRequestError(
        "Please wait before requesting another verification email"
      );
    }
    
    const token = generateToken()

    await emailVerificationStore.set(
          userId,
          token
        );

    const link = generateVerificationLink(userId,token);
    
    return this.send({
      type: EMAIL_TYPES.VERIFY_EMAIL,
      to,
      userId,
      data: { name, link }
    });
  }

  async sendForgotPasswordEmail({ to, userName, userId }) {

    const count = await otpRequests.incr(userId);
  
    if (count > AUTH_CONFIG.OTP.REQUEST_LIMIT) {
      throw new OtpRequestLimitError({ userId, count });
    }
    const otp = generateOtp();
    await otpStore.set(userId, otp);
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