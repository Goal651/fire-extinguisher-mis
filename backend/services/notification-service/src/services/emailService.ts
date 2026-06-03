import { transporter } from "../config/mailer";

// Plain payload shape received from RabbitMQ
export interface ExtinguisherPayload {
  extinguisherId: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  ownerIdNumber: string;
  expirationDate: string; // ISO string
  alertSentAt?: string | null;
}

// ─────────────────────────────────────────────
// Shared layout (identical to monolith)
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
        <table width="600" cellpadding="0" cellspacing="0"
          style="max-width:600px;width:100%;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:#0a0a0a;padding:28px 40px;text-align:center;">
              <span style="font-size:22px;font-weight:700;color:#ffffff;letter-spacing:1px;">TZW LTD</span><br/>
              <span style="font-size:12px;color:#aaaaaa;letter-spacing:2px;text-transform:uppercase;">Safety Management System</span>
            </td>
          </tr>
          <tr><td style="background:#1565c0;height:4px;"></td></tr>
          <tr><td style="padding:40px 40px 32px;">${content}</td></tr>
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
</html>`;

const h2 = (t: string) => `<h2 style="margin:0 0 20px;font-size:22px;color:#0a0a0a;font-weight:700;">${t}</h2>`;
const p  = (t: string) => `<p style="margin:0 0 16px;font-size:15px;color:#333333;line-height:1.6;">${t}</p>`;
const badge = (t: string, c: string) => `<span style="display:inline-block;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600;background:${c};color:#ffffff;">${t}</span>`;
const divider = () => `<hr style="border:none;border-top:1px solid #e8e8e8;margin:24px 0;" />`;
const infoTable = (rows: { label: string; value: string }[]) => `
  <table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;border:1px solid #e0e0e0;border-radius:6px;overflow:hidden;">
    ${rows.map((r, i) => `
    <tr style="background:${i % 2 === 0 ? "#f9f9f9" : "#ffffff"};">
      <td style="padding:12px 16px;font-size:13px;font-weight:600;color:#555555;white-space:nowrap;border-bottom:1px solid #e0e0e0;">${r.label}</td>
      <td style="padding:12px 16px;font-size:13px;color:#111111;border-bottom:1px solid #e0e0e0;">${r.value}</td>
    </tr>`).join("")}
  </table>`;

// ─────────────────────────────────────────────
// Core send
// ─────────────────────────────────────────────
export const sendEmail = async (to: string | string[], subject: string, html: string) => {
  return transporter.sendMail({ from: process.env.MAIL_FROM, to, subject, html });
};

// ─────────────────────────────────────────────
// 1. Expiry Warning  →  owner
// ─────────────────────────────────────────────
export const sendExpiryWarningEmail = async (ext: ExtinguisherPayload) => {
  const html = layout(`
    <table cellpadding="0" cellspacing="0" style="margin-bottom:20px;"><tr><td>${badge("URGENT NOTICE", "#c62828")}</td></tr></table>
    ${h2("Your Fire Extinguisher Expires Tomorrow")}
    ${p(`Dear <strong>${ext.ownerName}</strong>,`)}
    ${p("Our records show that your fire extinguisher is expiring <strong>tomorrow</strong>. Immediate action is required.")}
    ${infoTable([
      { label: "Extinguisher ID",  value: ext.extinguisherId },
      { label: "Expiration Date",  value: new Date(ext.expirationDate).toDateString() },
      { label: "Status",           value: "Expiring Soon" },
    ])}
    ${divider()}
    ${p("Please report to <strong>TZW LTD</strong> immediately for inspection or renewal.")}
    ${p('<span style="color:#c62828;font-weight:600;">Failure to respond within 3 days may result in escalation to authorities.</span>')}
  `, "Fire Extinguisher Expiry Notice");

  return sendEmail(ext.ownerEmail, "URGENT: Your Fire Extinguisher Expires Tomorrow", html);
};

// ─────────────────────────────────────────────
// 2. Expired  →  owner + staff
// ─────────────────────────────────────────────
export const sendExpiredNotificationEmail = async (ext: ExtinguisherPayload) => {
  const ownerHtml = layout(`
    <table cellpadding="0" cellspacing="0" style="margin-bottom:20px;"><tr><td>${badge("EXPIRED", "#c62828")}</td></tr></table>
    ${h2("Your Fire Extinguisher Has Expired")}
    ${p(`Dear <strong>${ext.ownerName}</strong>,`)}
    ${p("Your fire extinguisher has officially <strong>expired</strong>. Immediate action is required.")}
    ${infoTable([
      { label: "Extinguisher ID", value: ext.extinguisherId },
      { label: "Expiration Date", value: new Date(ext.expirationDate).toDateString() },
      { label: "Status",          value: "Expired" },
    ])}
    ${divider()}
    ${p("Please contact <strong>TZW LTD</strong> to schedule an inspection or renewal.")}
    ${p('<span style="color:#c62828;font-weight:600;">Failure to respond within 3 days will result in escalation to authorities.</span>')}
  `, "Fire Extinguisher Expired");

  const staffHtml = layout(`
    <table cellpadding="0" cellspacing="0" style="margin-bottom:20px;"><tr><td>${badge("ACTION REQUIRED", "#1565c0")}</td></tr></table>
    ${h2("Extinguisher Expired — Staff Alert")}
    ${p("The following fire extinguisher has been marked as <strong>expired</strong>. Please follow up with the owner.")}
    ${infoTable([
      { label: "Extinguisher ID", value: ext.extinguisherId },
      { label: "Owner Name",      value: ext.ownerName },
      { label: "Owner Email",     value: ext.ownerEmail },
      { label: "Owner Phone",     value: ext.ownerPhone },
      { label: "Owner ID",        value: ext.ownerIdNumber },
      { label: "Expiration Date", value: new Date(ext.expirationDate).toDateString() },
    ])}
    ${divider()}
    ${p("Generated automatically by the TZW LTD Safety Management System.")}
  `, "Extinguisher Expired — Staff Alert");

  const staffEmails = [
    process.env.ADMIN_EMAIL,
    process.env.INSPECTOR_EMAIL,
  ].filter(Boolean) as string[];

  await Promise.all([
    sendEmail(ext.ownerEmail, "ACTION REQUIRED: Your Fire Extinguisher Has Expired", ownerHtml),
    sendEmail(staffEmails, `[Staff Alert] Extinguisher ${ext.extinguisherId} Has Expired`, staffHtml),
  ]);
};

// ─────────────────────────────────────────────
// 3. Police Escalation  →  owner
// ─────────────────────────────────────────────
export const sendPoliceEscalationEmail = async (ext: ExtinguisherPayload) => {
  const html = layout(`
    <table cellpadding="0" cellspacing="0" style="margin-bottom:20px;"><tr><td>${badge("FINAL NOTICE", "#0a0a0a")}</td></tr></table>
    ${h2("Authorities Have Been Notified")}
    ${p(`Dear <strong>${ext.ownerName}</strong>,`)}
    ${p("Despite previous notifications, you have not responded. The relevant authorities have now been informed.")}
    ${infoTable([
      { label: "Extinguisher ID", value: ext.extinguisherId },
      { label: "Expiration Date", value: new Date(ext.expirationDate).toDateString() },
      { label: "Status",          value: "Police Notified" },
    ])}
    ${divider()}
    ${p("To resolve this matter, contact TZW LTD immediately.")}
  `, "Final Notice - Authorities Contacted");

  return sendEmail(ext.ownerEmail, "Final Notice - Authorities Have Been Contacted", html);
};

// ─────────────────────────────────────────────
// 4. Police Notification  →  admin & police
// ─────────────────────────────────────────────
export const sendPoliceNotificationEmail = async (ext: ExtinguisherPayload) => {
  const html = layout(`
    <table cellpadding="0" cellspacing="0" style="margin-bottom:20px;"><tr><td>${badge("NON-COMPLIANCE REPORT", "#1565c0")}</td></tr></table>
    ${h2("Fire Extinguisher Non-Compliance Report")}
    ${p("The following individual has failed to renew their fire extinguisher after multiple notifications.")}
    ${infoTable([
      { label: "Owner Name",       value: ext.ownerName },
      { label: "ID Number",        value: ext.ownerIdNumber },
      { label: "Phone",            value: ext.ownerPhone },
      { label: "Email",            value: ext.ownerEmail },
      { label: "Extinguisher ID",  value: ext.extinguisherId },
      { label: "Expiration Date",  value: new Date(ext.expirationDate).toDateString() },
      { label: "Initial Alert",    value: ext.alertSentAt ? new Date(ext.alertSentAt).toDateString() : "N/A" },
    ])}
    ${divider()}
    ${p("Generated automatically by the TZW LTD Safety Management System.")}
  `, "Non-Compliance Report");

  return sendEmail(
    [process.env.ADMIN_EMAIL!, process.env.POLICE_EMAIL!],
    "Fire Extinguisher Non-Compliance Report",
    html,
  );
};
