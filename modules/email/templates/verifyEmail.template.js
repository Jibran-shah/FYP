import { baseTemplate } from "./base.template.js";

// 🔒 Escape
const escapeHtml = (str = "") =>
  String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const validateUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const verifyEmailTemplate = ({ name, link }) => {
  if (!link || !validateUrl(link)) {
    throw new Error("Invalid or missing verification link");
  }

  const safeName = escapeHtml(name || "User");
  const safeLink = link;

  const subject = "Verify Your Email";

  const content = `
    <h2>Hello ${safeName},</h2>
    <p>Please verify your email by clicking the button below:</p>

    <a href="${safeLink}" 
       style="display:inline-block;padding:10px 16px;background:#007bff;color:#fff;text-decoration:none;border-radius:4px;">
       Verify Email
    </a>

    <p>If the button doesn't work, use this link:</p>
    <p style="word-break:break-all;">${safeLink}</p>
  `;

  return {
    subject,
    html: baseTemplate({ title: subject, content })
  };
};