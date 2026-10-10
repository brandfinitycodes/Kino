const sendEmail = async ({ to, subject, html, text }) => {
  // Real email sending has been disabled.
  // This is a dummy function to simulate success for local and deployed testing.
  console.log('----------------------------------------------------');
  console.log(`[DEV EMAIL SIMULATION] To: ${to}`);
  console.log(`[DEV EMAIL SIMULATION] Subject: ${subject}`);
  console.log('----------------------------------------------------');
  return { success: true, simulated: true };
};

module.exports = sendEmail;
