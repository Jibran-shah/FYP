import nodemailer from "nodemailer";
import { EMAIL_CONFIG } from "../../../config/email.config.js";
import { InternalServerError } from "../../../errors/index.js";
import { logger } from "../../../config/logger.js";

let transporter = null;
let isVerified = false;

const getTransporter = () => {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: EMAIL_CONFIG.SMTP.HOST,
    port: EMAIL_CONFIG.SMTP.PORT,
    secure: EMAIL_CONFIG.SMTP.SECURE,
    auth: {
      user: EMAIL_CONFIG.SMTP.USER,
      pass: EMAIL_CONFIG.SMTP.PASS
    },
    pool: EMAIL_CONFIG.SMTP.POOL.ENABLED,
    maxConnections: EMAIL_CONFIG.SMTP.POOL.MAX_CONNECTIONS,
    maxMessages: EMAIL_CONFIG.SMTP.POOL.MAX_MESSAGES,
    rateDelta: EMAIL_CONFIG.SMTP.POOL.RATE_DELTA_MS,
    rateLimit: EMAIL_CONFIG.SMTP.POOL.RATE_LIMIT
  });

  return transporter;
};

// 🔥 Verify ONCE safely (no race)
const verifyTransporter = async () => {
  if (isVerified) return;
  try {
    await getTransporter().verify();
    isVerified = true;
    console.log("✅ SMTP ready");
  } catch (err) {
    logger.error("❌ SMTP verify failed:",{error:{message:err}});
    throw err;
  }
};

export const smtpProvider = {
  sendEmail: async ({ to, subject, html, idempotencyKey }) => {
    const transporter = getTransporter();
    // ✅ verify before sending (only once)
    if (!isVerified) {
      await verifyTransporter();
    }

    // 🔒 normalize input
    const safeTo = String(to).trim().toLowerCase();
    const safeSubject = String(subject || "").trim();

    if (!safeTo) throw new InternalServerError("Invalid recipient email");
    if (!safeSubject) throw new InternalServerError("Email subject is required");
    if (!html) throw new InternalServerError("Email HTML content is required");

    // 🔥 headers for idempotency / tracing
    const headers = {};
    if (idempotencyKey) {
      headers["X-Idempotency-Key"] = idempotencyKey;
    }

    const info = await transporter.sendMail({
      from: `"${EMAIL_CONFIG.SMTP.FROM.NAME || "App"}" <${EMAIL_CONFIG.SMTP.FROM.EMAIL}>`,
      to: safeTo,
      subject: safeSubject,
      html,
      headers
    });

    return {
      messageId: info.messageId,
      provider: "smtp",
      accepted: info.accepted,
      rejected: info.rejected,
      response: info.response
    };
  }
};