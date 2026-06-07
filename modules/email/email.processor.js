import { EMAIL_TYPES } from "./email.constants.js";
import { buildEmailContent, sendEmailWithTimeout, normalizeEmail } from "./utils/email.utils.js";
import { getValidProvider } from "./providers/index.js";
import {
  markEmailSuccess,
  markEmailFailure
} from "./logs/emailLog.service.js";
import { createLog } from "./logs/emailLog.utils.js";
import { InternalServerError } from "../../errors/Http.error.js";


export const emailProcessor = async (job) => {
  const { type, to, data = {} } = job.data || {};

  if (!type || !to) {
    throw new InternalServerError("Invalid email job payload");
  }

  const normalizedTo = normalizeEmail(to);

  let log = null;

  try {

    const { subject, html } = buildEmailContent(type, data);

    log = await createLog({
      to: normalizedTo,
      type,
      subject,
      data,
      job
    });

    const provider = getValidProvider();

    const result = await sendEmailWithTimeout(provider, {
      to: normalizedTo,
      subject,
      html,
      idempotencyKey: job.id
    });

    await markEmailSuccess(log._id, result);

    return true;

  } catch (err) {
    
    if (log?._id) {
      try {
        await markEmailFailure(log._id, err);
      } catch (logErr) {
        console.error("❌ Failed to update email log:", logErr.message);
      }
    }

    //Let BullMQ retry
    throw err;
  }
};



