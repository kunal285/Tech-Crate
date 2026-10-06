const mongoose = require('mongoose');

const securityLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'LOGIN_SUCCESS',
        'LOGIN_FAILED',
        'OTP_SENT',
        'CUSTOMER_LOGIN',
        'STUDENT_LOGIN',
        'FIREBASE_AUTH_SUCCESS',
        'FIREBASE_AUTH_FAILED',
        'PASSWORD_RESET_REQUESTED',
        'PASSWORD_RESET_COMPLETED',
        'PASSWORD_CHANGED',
        'EMAIL_VERIFIED',
        'VERIFICATION_EMAIL_SENT',
        'MFA_ENABLED',
        'MFA_DISABLED',
        'MFA_VERIFIED',
        'RECOVERY_CODES_REGENERATED',
        'SESSION_REVOKED',
        'ALL_SESSIONS_REVOKED',
        'ACCOUNT_LOCKED',
      ],
    },
    ipAddress: {
      type: String,
      default: 'Unknown IP',
    },
    userAgent: {
      type: String,
      default: 'Unknown Client',
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('SecurityLog', securityLogSchema);
