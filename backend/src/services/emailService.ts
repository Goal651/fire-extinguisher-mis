import { transporter } from "../config/mailer";

import { IFireExtinguisher } from "../models/FireExtinguisher";

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

export const sendExpiryWarningEmail = async (
  extinguisher: IFireExtinguisher,
) => {
  return sendEmail(
    extinguisher.ownerEmail,
    "URGENT: Your Fire Extinguisher Expires Tomorrow",
    `
      <h2>Fire Extinguisher Expiry Notice</h2>

      <p>Dear ${extinguisher.ownerName},</p>

      <p>
      Your fire extinguisher
      <strong>${extinguisher.extinguisherId}</strong>
      expires on
      <strong>
      ${extinguisher.expirationDate.toDateString()}
      </strong>
      </p>

      <p>
      Please report to Company XYZ
      immediately for inspection or renewal.
      </p>

      <p>
      Failure to respond within
      3 days may result in
      escalation to authorities.
      </p>

      <br/>

      Company XYZ Safety Department
      `,
  );
};

export const sendPoliceEscalationEmail = async (
  extinguisher: IFireExtinguisher,
) => {
  return sendEmail(
    extinguisher.ownerEmail,
    "Final Notice - Authorities Contacted",
    `
      <h2>Final Notice</h2>

      <p>
      You failed to respond to
      previous notifications.
      </p>

      <p>
      Authorities have now been
      informed regarding your
      expired fire extinguisher.
      </p>

      <p>
      Extinguisher ID:
      ${extinguisher.extinguisherId}
      </p>

      Company XYZ
      `,
  );
};

export const sendPoliceNotificationEmail = async (
  extinguisher: IFireExtinguisher,
) => {
  return sendEmail(
    [process.env.ADMIN_EMAIL!, process.env.POLICE_EMAIL!],
    "Fire Extinguisher Non-Compliance Report",
    `
      <h2>Non Compliance Report</h2>

      <p>
      Name:
      ${extinguisher.ownerName}
      </p>

      <p>
      ID Number:
      ${extinguisher.ownerIdNumber}
      </p>

      <p>
      Phone:
      ${extinguisher.ownerPhone}
      </p>

      <p>
      Extinguisher ID:
      ${extinguisher.extinguisherId}
      </p>

      <p>
      Expiration Date:
      ${extinguisher.expirationDate.toDateString()}
      </p>

      <p>
      Alert Sent:
      ${extinguisher.alertSentAt}
      </p>

      Company XYZ Safety Department
      `,
  );
};
