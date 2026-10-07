const mongoose = require('mongoose');

const deviceTokenSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    platform: {
      type: String,
      enum: ['android', 'ios', 'web', 'unknown'],
      default: 'android',
    },
    lastActiveAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

deviceTokenSchema.index({ user: 1 });
deviceTokenSchema.index({ lastActiveAt: -1 });

module.exports = mongoose.model('DeviceToken', deviceTokenSchema);
