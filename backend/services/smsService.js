/**
 * Transactional SMS Provider Service
 * Connects to production SMS Gateways (e.g. Twilio, MSG91, Fast2SMS)
 * Environment Variables:
 * - SMS_PROVIDER_API_KEY
 * - SMS_PROVIDER_SECRET
 * - SMS_SENDER_ID
 */

const maskPhoneNumber = (phone) => {
  if (!phone || phone.length < 4) return '******';
  const clean = phone.replace(/\D/g, '');
  if (clean.length >= 10) {
    return `+91 ******${clean.slice(-4)}`;
  }
  return `******${phone.slice(-4)}`;
};

const sendOtpSMS = async (phoneNumber, otp) => {
  const maskedPhone = maskPhoneNumber(phoneNumber);
  const message = `Your verification code is ${otp}. It is valid for 5 minutes. Do not share this code with anyone.`;

  try {
    // In Development / Test mode, output formatted SMS to server console
    if (process.env.NODE_ENV !== 'production' || !process.env.SMS_PROVIDER_API_KEY) {
      console.log(`\n==================================================`);
      console.log(`📱 [SMS Gateway Simulator] OTP sent to: ${maskedPhone}`);
      console.log(`💬 Message: "${message}"`);
      console.log(`🔐 Raw OTP (Dev Mode): [ ${otp} ]`);
      console.log(`==================================================\n`);
      return { success: true, simulated: true, maskedPhone };
    }

    // Production SMS Gateway Call (e.g., Twilio or MSG91)
    const apiKey = process.env.SMS_PROVIDER_API_KEY;
    const senderId = process.env.SMS_SENDER_ID || 'PROJKT';

    // Example HTTP API call for transactional SMS provider
    const axios = require('axios');
    await axios.post(
      'https://api.sms-provider.com/v1/send',
      {
        sender: senderId,
        to: phoneNumber,
        message,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log(`[SMS Gateway] Transactional OTP sent successfully to ${maskedPhone}`);
    return { success: true, maskedPhone };
  } catch (error) {
    console.error(`[SMS Gateway Error] Failed to send SMS to ${maskedPhone}:`, error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendOtpSMS,
  maskPhoneNumber,
};
