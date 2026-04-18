import { baseTemplate } from "./base.template.js";
import { escapeHtml } from "../utils/email.utils.js";

export const forgotPasswordTemplate = ({ otp, userName }) => {
  const safeName = escapeHtml(userName || "User");

  const subject = "Reset Your Password";

  const content = `
    <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
      
      <h2 style="color: #111; margin-bottom: 10px;">
        Hello ${safeName},
      </h2>

      <p style="font-size: 15px;">
        We received a request to reset your password.
      </p>

      <p style="font-size: 15px;">
        Use the OTP below to complete your password reset:
      </p>

      <div style="text-align: center; margin: 25px 0;">
        <span style="
          display: inline-block;
          font-size: 28px;
          letter-spacing: 6px;
          font-weight: bold;
          background: #f4f4f4;
          padding: 12px 24px;
          border-radius: 8px;
          color: #222;
        ">
          ${otp}
        </span>
      </div>

      <p style="font-size: 14px; color: #555;">
        This OTP is valid for a limited time. Do not share it with anyone.
      </p>

      <p style="font-size: 14px; color: #999;">
        If you did not request this, you can safely ignore this email.
      </p>

      <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />

      <p style="font-size: 12px; color: #aaa;">
        © ${new Date().getFullYear()} Your Company. All rights reserved.
      </p>

    </div>
  `;

  return {
    subject,
    html: baseTemplate({ title: subject, content })
  };
};