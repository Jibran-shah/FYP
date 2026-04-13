import { EMAIL_TYPES } from "./email.constants.js";
import { buildEmailContent, sendEmailWithTimeout, normalizeEmail } from "./utils/email.utils.js";
import { getValidProvider } from "./providers/index.js";
import {
  markEmailSuccess,
  markEmailFailure
} from "./logs/emailLog.service.js";
import { createLog } from "./logs/emailLog.utils.js";

// =========================
// 🚀 MAIN PROCESSOR
// =========================

export const emailProcessor = async (job) => {
  const { type, to, data = {} } = job.data || {};

  if (!type || !to) {
    throw new Error("Invalid email job payload");
  }

  const normalizedTo = normalizeEmail(to);

  let log = null;

  try {
    // 1️⃣ Build content
    const { subject, html } = buildEmailContent(type, data);

    // 2️⃣ Create log
    log = await createLog({
      to: normalizedTo,
      type,
      subject,
      data,
      job
    });

    // 3️⃣ Get provider
    const provider = getValidProvider();

    // 4️⃣ Send email
    const result = await sendEmailWithTimeout(provider, {
      to: normalizedTo,
      subject,
      html,
      idempotencyKey: job.id
    });

    // 5️⃣ Mark success
    await markEmailSuccess(log._id, result);

    return true;

  } catch (err) {
    // 6️⃣ Mark failure
    if (log?._id) {
      try {
        await markEmailFailure(log._id, err);
      } catch (logErr) {
        console.error("❌ Failed to update email log:", logErr.message);
      }
    }

    // 7️⃣ Let BullMQ retry
    throw err;
  }
};



