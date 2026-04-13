import { emailQueue } from "./email.queue.js";
import { EMAIL_JOB_TYPES } from "./email.constants.js";
import crypto from "crypto";

const hashObject = (obj) =>
  crypto.createHash("sha256")
    .update(JSON.stringify(obj))
    .digest("hex");

const generateJobId = ({ to, type, data = {} }) =>
  `${type}:${to}:${hashObject(data)}`;

export const addEmailJob = async (payload, options = {}) => {
  const jobId = options.jobId || generateJobId(payload);

  return emailQueue.add(
    EMAIL_JOB_TYPES.SEND_EMAIL,
    payload,
    { ...options, jobId }
  );
};