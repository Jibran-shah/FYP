import { EMAIL_CONFIG } from "../../../config/email.config.js";
import { InternalServerError } from "../../../errors/Http.error.js";
import { smtpProvider } from "./smtp.provider.js";

const providers = {
  smtp: smtpProvider
};

export const getEmailProvider = () => {
  const providerName = (EMAIL_CONFIG.PROVIDER).toLowerCase();

  const provider = providers[providerName];
  if (!provider) {
    throw new InternalServerError(`Unsupported email provider: ${providerName}`);
  }

  if (typeof provider.sendEmail !== "function") {
    throw new InternalServerError(`Invalid provider implementation: ${providerName}`);
  }

  return provider;
};


// =========================
// 🔌 PROVIDER VALIDATION
// =========================

export const getValidProvider = () => {
  const provider = getEmailProvider();

  if (!provider || typeof provider.sendEmail !== "function") {
    throw new InternalServerError("Invalid email provider");
  }

  return provider;
};