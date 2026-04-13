import nodemailer from "nodemailer";

let transporter = null;
let isVerified = false;

// 🔒 Validate env early
const validateEnv = () => {
  const required = [
    "SMTP_HOST",
    "SMTP_PORT",
    "SMTP_USER",
    "SMTP_PASS",
    "EMAIL_FROM"
  ];

  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`Missing required env: ${key}`);
    }
  }
};

const getTransporter = () => {
  if (transporter) return transporter;

  validateEnv();

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    pool: true, // ✅ enable connection pooling
    maxConnections: 5,
    maxMessages: 100,
    rateDelta: 1000,
    rateLimit: 10
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
    console.error("❌ SMTP verify failed:", err.message);
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

    if (!safeTo) throw new Error("Invalid recipient email");
    if (!safeSubject) throw new Error("Email subject is required");
    if (!html) throw new Error("Email HTML content is required");

    // 🔥 headers for idempotency / tracing
    const headers = {};
    if (idempotencyKey) {
      headers["X-Idempotency-Key"] = idempotencyKey;
    }

    const info = await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || "App"}" <${process.env.EMAIL_FROM}>`,
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