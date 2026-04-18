import { escapeHtml } from "../utils/email.utils.js";

export const baseTemplate = ({ title, content }) => {
  const safeTitle = escapeHtml(title);

  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>${safeTitle}</title>
    </head>
    <body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
      
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:20px;">
        <tr>
          <td align="center">

            <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;padding:20px;">
              <tr>
                <td>

                  ${content}

                  <div style="margin-top:20px;font-size:12px;color:#888;">
                    If you did not request this, please ignore this email.
                  </div>

                </td>
              </tr>
            </table>

          </td>
        </tr>
      </table>

    </body>
  </html>
  `;
};