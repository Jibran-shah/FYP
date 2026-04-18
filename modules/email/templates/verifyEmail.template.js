import { escapeHtml } from "../utils/email.utils.js";
import { baseTemplate } from "./base.template.js";

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

  const subject = "Verify Your Email Address";

  const content = `
    <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">

      <h2 style="color:#111; margin-bottom: 10px;">
        Hello ${safeName},
      </h2>

      <p style="font-size: 15px;">
        Welcome! Please verify your email address to activate your account.
      </p>

      <div style="text-align: center; margin: 25px 0;">
        <a href="${safeLink}"
          style="
            display: inline-block;
            padding: 12px 20px;
            background: #2563eb;
            color: #fff;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            font-size: 14px;
          ">
          Verify Email
        </a>
      </div>

      <p style="font-size: 14px; color: #555;">
        If the button doesn’t work, copy and paste this link into your browser:
      </p>

      <p style="
        font-size: 13px;
        word-break: break-all;
        background: #f5f5f5;
        padding: 10px;
        border-radius: 6px;
        color: #333;
      ">
        ${safeLink}
      </p>

      <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />

      <p style="font-size: 12px; color: #999;">
        If you did not create this account, you can safely ignore this email.
      </p>

    </div>
  `;

  return {
    subject,
    html: baseTemplate({ title: subject, content })
  };
};