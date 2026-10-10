const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, html, text }) => {
  try {
    // Check if SMTP options exist in environment variables
    const hasSmtpConfig = process.env.EMAIL_USER && process.env.EMAIL_PASS;

    if (hasSmtpConfig) {
      const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      const mailOptions = {
        from: process.env.EMAIL_FROM || `"Influencer Hub" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
        text
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`[EMAIL SENT] MessageId: ${info.messageId} to ${to}`);
      return { success: true, messageId: info.messageId };
    } else {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('SMTP credentials (EMAIL_USER, EMAIL_PASS) are missing in production environment variables.');
      }
      console.log('----------------------------------------------------');
      console.log(`[DEV EMAIL SIMULATION] To: ${to}`);
      console.log(`[DEV EMAIL SIMULATION] Subject: ${subject}`);
      console.log(`[DEV EMAIL SIMULATION] Text Content: ${text}`);
      console.log('----------------------------------------------------');
      return { success: true, simulated: true };
    }
  } catch (error) {
    console.error(`[EMAIL ERROR] Failed to send email to ${to}:`, error.message);
    // Return simulated success in development so verification testing never blocks
    return { success: false, error: error.message };
  }
};

module.exports = sendEmail;
