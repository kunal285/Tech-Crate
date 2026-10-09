/**
 * Security Email Notification Service
 * Logs secure notifications and formats security email templates.
 * Can be connected to SMTP/Nodemailer/Sendgrid using process.env SMTP variables.
 */

const sendSecurityEmail = async ({ to, subject, html, text }) => {
  try {
    // In development or when SMTP environment variables are not set, log safely
    if (process.env.NODE_ENV !== 'production' || !process.env.SMTP_HOST) {
      console.log(`[Security Notification Email] To: ${to} | Subject: "${subject}"`);
      return true;
    }

    // Production SMTP integration placeholder
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM || '"TechCrate Security" <security@TechCrate.com>',
      to,
      subject,
      text,
      html,
    });
    return true;
  } catch (error) {
    console.error('[Email Notification Error]', error.message);
    return false;
  }
};

const sendVerificationEmail = async (email, rawToken) => {
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${rawToken}`;
  const subject = 'TechCrate — Verify your account email address';
  const text = `Please verify your email by opening the following URL: ${verificationUrl}\nThis token will expire in 24 hours.`;
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b;">
      <h2>Welcome to TechCrate!</h2>
      <p>Thank you for registering. Please click the button below to verify your email address:</p>
      <p style="margin: 25px 0;">
        <a href="${verificationUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">Verify Email Address</a>
      </p>
      <p style="font-size: 12px; color: #64748b;">Or copy this link: ${verificationUrl}</p>
      <p style="font-size: 12px; color: #94a3b8;">If you did not create this account, please ignore this email.</p>
    </div>
  `;
  return sendSecurityEmail({ to: email, subject, html, text });
};

const sendPasswordResetEmail = async (email, rawToken) => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${rawToken}`;
  const subject = 'TechCrate — Password Reset Request';
  const text = `You requested a password reset. Please open this link to reset your password: ${resetUrl}\nThis link is valid for 15 minutes.`;
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b;">
      <h2>Password Reset Request</h2>
      <p>We received a request to reset your TechCrate account password.</p>
      <p style="margin: 25px 0;">
        <a href="${resetUrl}" style="background-color: #ef4444; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">Reset Password</a>
      </p>
      <p style="font-size: 12px; color: #64748b;">This link will expire in 15 minutes.</p>
      <p style="font-size: 12px; color: #94a3b8;">If you did not request a password reset, please secure your account immediately.</p>
    </div>
  `;
  return sendSecurityEmail({ to: email, subject, html, text });
};

const sendSecurityAlertEmail = async (email, title, details) => {
  const subject = `TechCrate Security Alert: ${title}`;
  const text = `Security Event: ${title}\nDetails: ${details}\nDate: ${new Date().toISOString()}`;
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b;">
      <h3 style="color: #dc2626;">Security Alert: ${title}</h3>
      <p>${details}</p>
      <p style="font-size: 12px; color: #64748b;">Time: ${new Date().toUTCString()}</p>
      <p style="font-size: 12px; color: #94a3b8;">If this wasn't you, please reset your password immediately.</p>
    </div>
  `;
  return sendSecurityEmail({ to: email, subject, html, text });
};

module.exports = {
  sendEmail: sendSecurityEmail,
  sendSecurityEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendSecurityAlertEmail,
};
