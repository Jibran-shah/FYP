import { smtpProvider } from "./smtp.provider.js";

const providers = {
  smtp: smtpProvider
};

export const getEmailProvider = () => {
  const providerName = (process.env.EMAIL_PROVIDER || "smtp").toLowerCase();

  const provider = providers[providerName];

  if (!provider) {
    throw new Error(`Unsupported email provider: ${providerName}`);
  }

  if (typeof provider.sendEmail !== "function") {
    throw new Error(`Invalid provider implementation: ${providerName}`);
  }

  return provider;
};


// =========================
// 🔌 PROVIDER VALIDATION
// =========================

export const getValidProvider = () => {
  const provider = getEmailProvider();

  if (!provider || typeof provider.sendEmail !== "function") {
    throw new Error("Invalid email provider");
  }

  return provider;
};