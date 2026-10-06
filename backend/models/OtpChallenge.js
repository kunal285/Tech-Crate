const mongoose = require('mongoose');

const otpChallengeSchema = new mongoose.Schema(
  {
    phoneNumber: {
      type: String,
      required: true,
      index: true,
    },
    otpHash: {
      type: String,
      required: true,
    },
    requestId: {
      type: String,
      required: true,
      unique: true,
    },
    attemptCount: {
      type: Number,
      default: 0,
    },
    used: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // Automatically remove expired challenges from DB
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('OtpChallenge', otpChallengeSchema);
