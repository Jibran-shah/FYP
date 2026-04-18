import EmailLog from "./emailLog.model.js";
import { EMAIL_STATUS_TYPES } from "../email.constants.js";

// 🔒 sanitize error object
const serializeError = (error) => ({
  message: error?.message || "Unknown error",
  stack: error?.stack || ""
});

// ------------------------
// CREATE LOG (PENDING)
// ------------------------
export const createEmailLog = async ({
  to,
  type,
  subject,
  meta,
  user
}) => {
  if (!to || !type) {
    throw new Error("Missing required email log fields");
  }

  return EmailLog.create({
    to: String(to).toLowerCase().trim(),
    type,
    subject,
    meta,
    user,
    status: EMAIL_STATUS_TYPES.PENDING
  });
};

// ------------------------
// MARK SUCCESS
// ------------------------
export const markEmailSuccess = async (logId, data = {}) => {
  if (!logId) return null;

  return EmailLog.findByIdAndUpdate(
    logId,
    {
      status: EMAIL_STATUS_TYPES.SENT,
      provider: data.provider,
      messageId: data.messageId,
      error: undefined
    },
    {
      new: true,
      lean: true
    }
  );
};

// ------------------------
// MARK FAILURE
// ------------------------
export const markEmailFailure = async (logId, error) => {
  if (!logId) return null;

  return EmailLog.findByIdAndUpdate(
    logId,
    {
      status: EMAIL_STATUS_TYPES.FAILED,
      error: serializeError(error)
    },
    {
      new: true,
      lean: true
    }
  );
};