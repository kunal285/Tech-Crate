/**
 * Production Transactional SMS Service
 * Real SMS Gateway Integrations:
 * - Twilio (Global / US / India)
 * - Fast2SMS (India Quick / OTP Route)
 * - MSG91 (India DLT Compliant)
 * 
 * Security:
 * - NO raw OTP logging
 * - NO raw OTP returned in APIs
 * - NO hardcoded secrets
 */

const maskPhoneNumber = (phone) => {
  if (!phone || phone.length < 4) return '******';
  const clean = phone.replace(/\D/g, '');
  if (clean.length >= 10) {
    return `+91 ******${clean.slice(-4)}`;
  }
  return `******${phone.slice(-4)}`;
};

/**
 * Send real SMS OTP via configured SMS Gateway
 * @param {string} phoneNumber 10-digit mobile number
 * @param {string} otp 6-digit numeric OTP
 * @returns {Promise<{success: boolean, provider: string, maskedPhone: string}>}
 */
const sendOtpSMS = async (phoneNumber, otp) => {
  const maskedPhone = maskPhoneNumber(phoneNumber);
  const cleanPhone = phoneNumber.replace(/\D/g, '').slice(-10);
  const message = `Your Tech Crate verification code is ${otp}. It is valid for 5 minutes. Do not share this code with anyone.`;

  // 1. Twilio Integration
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromPhone = process.env.TWILIO_PHONE_NUMBER;
    const toPhone = cleanPhone.startsWith('+') ? cleanPhone : `+91${cleanPhone}`;

    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const params = new URLSearchParams();
    params.append('To', toPhone);
    params.append('From', fromPhone);
    params.append('Body', message);

    const authHeader = 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64');

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Twilio SMS Gateway error: ${data.message || response.statusText}`);
    }

    return {
      success: true,
      provider: 'twilio',
      messageId: data.sid,
      maskedPhone,
    };
  }

  // 2. Fast2SMS Integration (Popular Indian SMS Gateway)
  if (process.env.FAST2SMS_API_KEY) {
    const apiKey = process.env.FAST2SMS_API_KEY;
    const url = 'https://www.fast2sms.com/dev/bulkV2';

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'authorization': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        route: 'otp',
        variables_values: otp,
        numbers: cleanPhone,
      }),
    });

    const data = await response.json();

    if (!response.ok || (data.return === false && !data.status_code?.toString().startsWith('20'))) {
      throw new Error(`Fast2SMS Gateway error: ${data.message || 'SMS delivery failed'}`);
    }

    return {
      success: true,
      provider: 'fast2sms',
      requestId: data.request_id,
      maskedPhone,
    };
  }

  // 3. MSG91 Integration (India DLT Compliant)
  if (process.env.MSG91_AUTH_KEY && process.env.MSG91_TEMPLATE_ID) {
    const authKey = process.env.MSG91_AUTH_KEY;
    const templateId = process.env.MSG91_TEMPLATE_ID;
    const url = `https://control.msg91.com/api/v5/otp?template_id=${templateId}&mobile=91${cleanPhone}&authkey=${authKey}&otp=${otp}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok || data.type === 'error') {
      throw new Error(`MSG91 Gateway error: ${data.message || 'SMS delivery failed'}`);
    }

    return {
      success: true,
      provider: 'msg91',
      maskedPhone,
    };
  }

  // 4. Test Environment Handling (Only during automated CI/unit tests)
  if (process.env.NODE_ENV === 'test') {
    return {
      success: true,
      provider: 'test-environment',
      maskedPhone,
    };
  }

  // 5. Missing Credentials - Enforce Real Provider
  throw new Error(
    'SMS Gateway credentials missing. To send real SMS OTPs, configure TWILIO (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER) or FAST2SMS (FAST2SMS_API_KEY) in backend/.env'
  );
};

module.exports = {
  sendOtpSMS,
  maskPhoneNumber,
};
