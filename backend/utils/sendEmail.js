const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ to, subject, html, text }) => {
  try {
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY.includes('dummy')) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('Valid RESEND_API_KEY is missing in production environment variables.');
      }
      console.log('----------------------------------------------------');
      console.log(`[DEV EMAIL SIMULATION] To: ${to}`);
      console.log(`[DEV EMAIL SIMULATION] Subject: ${subject}`);
      console.log(`[DEV EMAIL SIMULATION] Text Content: ${text}`);
      console.log('----------------------------------------------------');
      return { success: true, simulated: true };
    }

    // IMPORTANT: Unless you verify a domain in Resend, you MUST send FROM onboarding@resend.dev
    // and you can ONLY send TO the email address you signed up to Resend with!
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Kino <onboarding@resend.dev>',
      to: [to],
      subject,
      html,
      text
    });

    if (error) {
      console.error(`[EMAIL ERROR] Failed to send email to ${to}:`, error.message);
      return { success: false, error: error.message };
    }

    console.log(`[EMAIL SENT] MessageId: ${data.id} to ${to}`);
    return { success: true, messageId: data.id };

  } catch (error) {
    console.error(`[EMAIL ERROR] Failed to send email to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
};

module.exports = sendEmail;
