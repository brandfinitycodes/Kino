const nodemailer = require('nodemailer');

// Build an OTP HTML email template
const generateOtpHtml = (otp) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verification Code</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
    <div style="max-width: 520px; margin: 40px auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05); border: 1px solid #f1f5f9;">
      
      <!-- Brand Header -->
      <div style="background: linear-gradient(135deg, #ea580c 0%, #f97316 100%); padding: 32px 24px; text-align: center;">
        <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">
          GrowFox
        </h1>
        <p style="margin: 6px 0 0; color: #ffedd5; font-size: 13px; font-weight: 500; text-transform: uppercase; letter-spacing: 1.5px;">
          Account Security Verification
        </p>
      </div>

      <!-- Content -->
      <div style="padding: 36px 32px; text-align: center;">
        <h2 style="margin: 0 0 12px; font-size: 20px; font-weight: 700; color: #0f172a;">
          Verify Your Email Address
        </h2>
        <p style="margin: 0 0 28px; font-size: 14px; color: #64748b; line-height: 1.6;">
          Use the 6-digit verification code below to complete your registration or verification request.
        </p>

        <!-- OTP Display Box -->
        <div style="background: #fff7ed; border: 2px dashed #fdba74; border-radius: 16px; padding: 20px; margin: 0 auto 28px; max-width: 280px;">
          <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 900; letter-spacing: 10px; color: #ea580c; display: inline-block; padding-left: 10px;">
            ${otp}
          </span>
        </div>

        <p style="margin: 0 0 8px; font-size: 13px; color: #94a3b8; font-weight: 600;">
          ⏳ This code expires in <strong style="color: #ea580c;">10 minutes</strong>.
        </p>
        <p style="margin: 0; font-size: 12px; color: #94a3b8; line-height: 1.5;">
          If you did not request this verification code, please ignore this email. Never share this code with anyone.
        </p>
      </div>

      <!-- Footer -->
      <div style="background: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #f1f5f9;">
        <p style="margin: 0; font-size: 11px; color: #94a3b8;">
          © ${new Date().getFullYear()} GrowFox. All rights reserved.
        </p>
      </div>

    </div>
  </body>
  </html>
  `;
};

// Create transporter
const createTransporter = () => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    return null;
  }

  // Check if custom SMTP host is defined, otherwise default to Gmail service
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true' || Number(process.env.SMTP_PORT) === 465,
      auth: { user, pass }
    });
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: user.trim(),
      pass: pass.replace(/\s+/g, '') // remove spaces from Gmail 16-character app passwords
    }
  });
};

/**
 * Send an email
 * @param {Object} options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Subject line
 * @param {string} [options.otp] - 6-digit OTP code (generates branded template)
 * @param {string} [options.html] - Custom HTML body
 * @param {string} [options.text] - Plain text body fallback
 */
const sendEmail = async ({ to, subject, otp, html, text }) => {
  const transporter = createTransporter();

  // If email credentials are not set, simulate for development
  if (!transporter) {
    console.warn('----------------------------------------------------');
    console.warn(`[EMAIL WARNING] EMAIL_USER or EMAIL_PASS is not configured in .env`);
    console.warn(`[SIMULATION] To: ${to}`);
    console.warn(`[SIMULATION] Subject: ${subject}`);
    if (otp) console.warn(`[SIMULATION] Generated OTP Code: ${otp}`);
    console.warn('----------------------------------------------------');
    return { success: true, simulated: true, otp };
  }

  const mailOptions = {
    from: `"GrowFox" <${process.env.EMAIL_USER.trim()}>`,
    to,
    subject: subject || 'Your Verification Code',
    text: text || (otp ? `Your GrowFox verification code is: ${otp}. It expires in 10 minutes.` : ''),
    html: html || (otp ? generateOtpHtml(otp) : undefined)
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ [EMAIL SENT] MessageId: ${info.messageId} to ${to}`);
    return { success: true, messageId: info.messageId, simulated: false };
  } catch (error) {
    console.error(`❌ [EMAIL ERROR] Failed to send email to ${to}:`, error.message);
    throw error;
  }
};

module.exports = sendEmail;
