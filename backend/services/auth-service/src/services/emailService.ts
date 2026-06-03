import { transporter } from "../../shared/config/mailer";

export const sendEmail = async (
  to: string,
  subject: string,
  html: string,
): Promise<void> => {
  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject,
    html,
  });
};

export const buildOtpHtml = (otp: string): string => `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><title>Your OTP Code</title></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0"
        style="max-width:600px;width:100%;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <tr><td style="background:#0a0a0a;padding:28px 40px;text-align:center;">
          <span style="font-size:22px;font-weight:700;color:#ffffff;">TZW LTD</span><br/>
          <span style="font-size:12px;color:#aaaaaa;letter-spacing:2px;text-transform:uppercase;">Safety Management System</span>
        </td></tr>
        <tr><td style="background:#1565c0;height:4px;"></td></tr>
        <tr><td style="padding:40px;">
          <h2 style="margin:0 0 20px;font-size:22px;color:#0a0a0a;">Your One-Time Password</h2>
          <p style="margin:0 0 16px;font-size:15px;color:#333333;">Use the following OTP to complete your login. It expires in 10 minutes.</p>
          <div style="text-align:center;margin:32px 0;">
            <span style="font-size:40px;font-weight:700;letter-spacing:12px;color:#1565c0;">${otp}</span>
          </div>
          <p style="margin:0;font-size:13px;color:#888888;">If you did not request this, please ignore this email.</p>
        </td></tr>
        <tr><td style="background:#f9f9f9;border-top:1px solid #e8e8e8;padding:20px 40px;text-align:center;">
          <p style="margin:0;font-size:12px;color:#888888;">Automated message from TZW LTD. Do not reply.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

export const buildPasswordResetHtml = (resetUrl: string): string => `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><title>Password Reset</title></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0"
        style="max-width:600px;width:100%;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <tr><td style="background:#0a0a0a;padding:28px 40px;text-align:center;">
          <span style="font-size:22px;font-weight:700;color:#ffffff;">TZW LTD</span><br/>
          <span style="font-size:12px;color:#aaaaaa;letter-spacing:2px;text-transform:uppercase;">Safety Management System</span>
        </td></tr>
        <tr><td style="background:#1565c0;height:4px;"></td></tr>
        <tr><td style="padding:40px;">
          <h2 style="margin:0 0 20px;font-size:22px;color:#0a0a0a;">Reset Your Password</h2>
          <p style="margin:0 0 16px;font-size:15px;color:#333333;">We received a request to reset your password. Click the button below. This link expires in 30 minutes.</p>
          <div style="text-align:center;margin:32px 0;">
            <a href="${resetUrl}" style="display:inline-block;padding:14px 32px;background:#1565c0;color:#ffffff;text-decoration:none;border-radius:6px;font-size:15px;font-weight:600;">Reset Password</a>
          </div>
          <p style="margin:0;font-size:13px;color:#888888;">If you did not request this, please ignore this email.</p>
        </td></tr>
        <tr><td style="background:#f9f9f9;border-top:1px solid #e8e8e8;padding:20px 40px;text-align:center;">
          <p style="margin:0;font-size:12px;color:#888888;">Automated message from TZW LTD. Do not reply.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

export const buildPasswordChangedHtml = (action: "reset" | "changed"): string => `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><title>Password ${action === "reset" ? "Reset" : "Changed"} Successfully</title></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0"
        style="max-width:600px;width:100%;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <tr><td style="background:#0a0a0a;padding:28px 40px;text-align:center;">
          <span style="font-size:22px;font-weight:700;color:#ffffff;">TZW LTD</span><br/>
          <span style="font-size:12px;color:#aaaaaa;letter-spacing:2px;text-transform:uppercase;">Safety Management System</span>
        </td></tr>
        <tr><td style="background:#1565c0;height:4px;"></td></tr>
        <tr><td style="padding:40px;">
          <h2 style="margin:0 0 20px;font-size:22px;color:#0a0a0a;">Password ${action === "reset" ? "Reset" : "Changed"} Successfully</h2>
          <p style="margin:0 0 16px;font-size:15px;color:#333333;">Your password has been ${action === "reset" ? "reset" : "changed"} successfully. You can now log in with your new password.</p>
          <p style="margin:0;font-size:13px;color:#888888;">If you did not make this change, please contact support immediately.</p>
        </td></tr>
        <tr><td style="background:#f9f9f9;border-top:1px solid #e8e8e8;padding:20px 40px;text-align:center;">
          <p style="margin:0;font-size:12px;color:#888888;">Automated message from TZW LTD. Do not reply.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
