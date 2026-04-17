import { baseTemplate } from "./base.template.js";
import { escapeHtml } from "../utils/email.utils.js";


export const forgotPasswordTemplate = ({ otp, userName }) => {

  const safeName = escapeHtml(userName || "User");

  const subject = "Reset Your Password";

  const content = `
    <h2>Hello ${safeName},</h2>
    <p>You requested a password reset.</p>

    rest password otp is " ${otp} "

    <p>don't share this with anyone</p>
    <p>If you didn't request this, ignore this email.</p>
  `;

  return {
    subject,
    html: baseTemplate({ title: subject, content })
  };
};