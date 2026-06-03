import { transporter } from "../config/mailer";
import { IFireExtinguisher } from "../models/FireExtinguisher";

// ─────────────────────────────────────────────
// Shared layout
// ─────────────────────────────────────────────

const layout = (content: string, title: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:#0a0a0a;padding:28px 40px;text-align:center;">
              <span style="font-size:22px;font-weight:700;color:#ffffff;letter-spacing:1px;">TZW LTD</span>
              <br/>
              <span style="font-size:12px;color:#aaaaaa;letter-spacing:2px;text-transform:uppercase;">Safety Management System</span>
            </td>
          </tr>

          <!-- Blue accent bar -->
          <tr>
            <td style="background:#1565c0;height:4px;"></td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9f9f9;border-top:1px solid #e8e8e8;padding:20px 40px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#888888;">
                This is an automated message from TZW LTD Safety Department.<br/>
                Please do not reply directly to this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

// ─────────────────────────────────────────────
// Reusable building blocks
// ─────────────────────────────────────────────

const heading = (text: string) =>
  `<h2 style="margin:0 0 20px;font-size:22px;color:#0a0a0a;font-weight:700;">${text}</h2>`;

const paragraph = (text: string) =>
  `<p style="margin:0 0 16px;font-size:15px;color:#333333;line-height:1.6;">${text}</p>`;

const btn = (href: string, label: string) => `
  <table cellpadding="0" cellspacing="0" style="margin:24px 0;">
    <tr>
      <td style="background:#1565c0;border-radius:6px;">
        <a href="${href}" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:6px;">${label}</a>
      </td>
    </tr>
  </table>
`;

const infoTable = (rows: { label: string; value: string }[]) => `
  <table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;border:1px solid #e0e0e0;border-radius:6px;overflow:hidden;">
    ${rows
      .map(
        (r, i) => `
    <tr style="background:${i % 2 === 0 ? "#f9f9f9" : "#ffffff"};">
      <td style="padding:12px 16px;font-size:13px;font-weight:600;color:#555555;white-space:nowrap;border-bottom:1px solid #e0e0e0;">${r.label}</td>
      <td style="padding:12px 16px;font-size:13px;color:#111111;border-bottom:1px solid #e0e0e0;">${r.value}</td>
    </tr>`,
      )
      .join("")}
  </table>
`;

const badge = (text: string, color: string) =>
  `<span style="display:inline-block;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600;background:${color};color:#ffffff;">${text}</span>`;

const divider = () =>
  `<hr style="border:none;border-top:1px solid #e8e8e8;margin:24px 0;" />`;

// ─────────────────────────────────────────────
// Core send helper
// ─────────────────────────────────────────────

export const sendEmail = async (
  to: string | string[],
  subject: string,
  html: string,
) => {
  return transporter.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject,
    html,
  });
};

// ─────────────────────────────────────────────
// OTP Email
// ─────────────────────────────────────────────

export const buildOtpHtml = (otp: string) =>
  layout(
    `
    ${heading("Login Verification Code")}
    ${paragraph("Use the code below to complete your sign-in. It expires in <strong>10 minutes</strong>.")}
    <table cellpadding="0" cellspacing="0" style="margin:28px 0;">
      <tr>
        <td style="background:#0a0a0a;border-radius:8px;padding:20px 40px;text-align:center;">
          <span style="font-size:40px;font-weight:700;color:#ffffff;letter-spacing:12px;">${otp}</span>
        </td>
      </tr>
    </table>
    ${paragraph("If you did not attempt to log in, please ignore this email and secure your account.")}
  `,
    "Your OTP Code",
  );

// ─────────────────────────────────────────────
// Password Reset Request
// ─────────────────────────────────────────────

export const buildPasswordResetHtml = (resetUrl: string) =>
  layout(
    `
    ${heading("Password Reset Request")}
    ${paragraph("We received a request to reset the password associated with your account.")}
    ${paragraph("Click the button below to choose a new password. This link expires in <strong>30 minutes</strong>.")}
    ${btn(resetUrl, "Reset My Password")}
    ${divider()}
    ${paragraph('<span style="font-size:13px;color:#888888;">If the button doesn\'t work, copy and paste this URL into your browser:<br/><span style="color:#1565c0;">' + resetUrl + "</span></span>")}
    ${paragraph('<span style="font-size:13px;color:#888888;">If you did not request a password reset, you can safely ignore this email.</span>')}
  `,
    "Password Reset Request",
  );

// ─────────────────────────────────────────────
// Password Reset / Changed Confirmation
// ─────────────────────────────────────────────

export const buildPasswordChangedHtml = (action: "reset" | "changed") =>
  layout(
    `
    <table cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td style="background:#0a0a0a;border-radius:50%;width:56px;height:56px;text-align:center;vertical-align:middle;">
          <span style="font-size:28px;line-height:56px;">✓</span>
        </td>
      </tr>
    </table>
    ${heading(action === "reset" ? "Password Reset Successful" : "Password Changed Successfully")}
    ${paragraph("Your password has been successfully " + (action === "reset" ? "reset" : "updated") + ".")}
    ${paragraph('<strong style="color:#c62828;">If you did not make this change, please contact our support team immediately.</strong>')}
  `,
    action === "reset" ? "Password Reset Successful" : "Password Changed Successfully",
  );

// ─────────────────────────────────────────────
// Expiry Warning Email (to owner)
// ─────────────────────────────────────────────

export const sendExpiryWarningEmail = async (
  extinguisher: IFireExtinguisher,
) => {
  const html = layout(
    `
    <table cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
      <tr><td>${badge("URGENT NOTICE", "#c62828")}</td></tr>
    </table>
    ${heading("Your Fire Extinguisher Expires Tomorrow")}
    ${paragraph(`Dear <strong>${extinguisher.ownerName}</strong>,`)}
    ${paragraph("Our records show that your fire extinguisher is expiring <strong>tomorrow</strong>. Immediate action is required to remain compliant.")}
    ${infoTable([
      { label: "Extinguisher ID", value: extinguisher.extinguisherId },
      { label: "Expiration Date", value: extinguisher.expirationDate.toDateString() },
      { label: "Status", value: "Expiring Soon" },
    ])}
    ${divider()}
    ${paragraph("Please report to <strong>TZW LTD</strong> immediately for inspection or renewal.")}
    ${paragraph('<span style="color:#c62828;font-weight:600;">Failure to respond within 3 days may result in escalation to the relevant authorities.</span>')}
  `,
    "Fire Extinguisher Expiry Notice",
  );

  return sendEmail(
    extinguisher.ownerEmail,
    "URGENT: Your Fire Extinguisher Expires Tomorrow",
    html,
  );
};

// ─────────────────────────────────────────────
// Expired Notification Email (to owner + admin + inspector)
// Sent after status flips to "expired"
// ─────────────────────────────────────────────

export const sendExpiredNotificationEmail = async (
  extinguisher: IFireExtinguisher,
) => {
  const ownerHtml = layout(
    `
    <table cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
      <tr><td>${badge("EXPIRED", "#c62828")}</td></tr>
    </table>
    ${heading("Your Fire Extinguisher Has Expired")}
    ${paragraph(`Dear <strong>${extinguisher.ownerName}</strong>,`)}
    ${paragraph("Your fire extinguisher has officially <strong>expired</strong> as of today. You are required to take immediate action to remain compliant with safety regulations.")}
    ${infoTable([
      { label: "Extinguisher ID", value: extinguisher.extinguisherId },
      { label: "Expiration Date", value: extinguisher.expirationDate.toDateString() },
      { label: "Status", value: "Expired" },
    ])}
    ${divider()}
    ${paragraph("Please contact <strong>TZW LTD</strong> immediately to schedule an inspection or renewal.")}
    ${paragraph('<span style="color:#c62828;font-weight:600;">Failure to respond within 3 days will result in escalation to the relevant authorities.</span>')}
  `,
    "Fire Extinguisher Expired",
  );

  const staffHtml = layout(
    `
    <table cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
      <tr><td>${badge("ACTION REQUIRED", "#1565c0")}</td></tr>
    </table>
    ${heading("Extinguisher Expired — Staff Alert")}
    ${paragraph("The following fire extinguisher has just been marked as <strong>expired</strong> by the system. Please follow up with the owner promptly.")}
    ${infoTable([
      { label: "Extinguisher ID", value: extinguisher.extinguisherId },
      { label: "Owner Name", value: extinguisher.ownerName },
      { label: "Owner Email", value: extinguisher.ownerEmail },
      { label: "Owner Phone", value: extinguisher.ownerPhone },
      { label: "Owner ID Number", value: extinguisher.ownerIdNumber },
      { label: "Expiration Date", value: extinguisher.expirationDate.toDateString() },
    ])}
    ${divider()}
    ${paragraph("This alert was generated automatically by the TZW LTD Safety Management System.")}
  `,
    "Extinguisher Expired — Staff Alert",
  );

  // Notify owner and staff in parallel
  await Promise.all([
    sendEmail(
      extinguisher.ownerEmail,
      "ACTION REQUIRED: Your Fire Extinguisher Has Expired",
      ownerHtml,
    ),
    sendEmail(
      [process.env.ADMIN_EMAIL!, process.env.INSPECTOR_EMAIL!].filter(Boolean) as string[],
      `[Staff Alert] Extinguisher ${extinguisher.extinguisherId} Has Expired`,
      staffHtml,
    ),
  ]);
};
// ─────────────────────────────────────────────

export const sendPoliceEscalationEmail = async (
  extinguisher: IFireExtinguisher,
) => {
  const html = layout(
    `
    <table cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
      <tr><td>${badge("FINAL NOTICE", "#0a0a0a")}</td></tr>
    </table>
    ${heading("Authorities Have Been Notified")}
    ${paragraph(`Dear <strong>${extinguisher.ownerName}</strong>,`)}
    ${paragraph("Despite our previous notifications, you have not responded regarding your expired fire extinguisher. As a result, the relevant authorities have now been informed.")}
    ${infoTable([
      { label: "Extinguisher ID", value: extinguisher.extinguisherId },
      { label: "Expiration Date", value: extinguisher.expirationDate.toDateString() },
      { label: "Status", value: "Police Notified" },
    ])}
    ${divider()}
    ${paragraph("If you believe this is an error or wish to resolve this matter, please contact TZW LTD immediately.")}
  `,
    "Final Notice - Authorities Contacted",
  );

  return sendEmail(
    extinguisher.ownerEmail,
    "Final Notice - Authorities Have Been Contacted",
    html,
  );
};

// ─────────────────────────────────────────────
// Police Notification Email (to admin & police)
// ─────────────────────────────────────────────

export const sendPoliceNotificationEmail = async (
  extinguisher: IFireExtinguisher,
) => {
  const html = layout(
    `
    <table cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
      <tr><td>${badge("NON-COMPLIANCE REPORT", "#1565c0")}</td></tr>
    </table>
    ${heading("Fire Extinguisher Non-Compliance Report")}
    ${paragraph("The following individual has failed to renew their fire extinguisher after multiple notifications. This report is submitted for official action.")}
    ${infoTable([
      { label: "Owner Name", value: extinguisher.ownerName },
      { label: "ID Number", value: extinguisher.ownerIdNumber },
      { label: "Phone", value: extinguisher.ownerPhone },
      { label: "Email", value: extinguisher.ownerEmail },
      { label: "Extinguisher ID", value: extinguisher.extinguisherId },
      { label: "Expiration Date", value: extinguisher.expirationDate.toDateString() },
      { label: "Initial Alert Sent", value: extinguisher.alertSentAt ? new Date(extinguisher.alertSentAt).toDateString() : "N/A" },
    ])}
    ${divider()}
    ${paragraph("This report was generated automatically by the TZW LTD Safety Management System.")}
  `,
    "Non-Compliance Report",
  );

  return sendEmail(
    [process.env.ADMIN_EMAIL!, process.env.POLICE_EMAIL!],
    "Fire Extinguisher Non-Compliance Report",
    html,
  );
};
