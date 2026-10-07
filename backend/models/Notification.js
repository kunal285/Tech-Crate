const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    body: {
      type: String,
      required: [true, 'Notification message body is required'],
      trim: true,
      maxlength: [1000, 'Body cannot exceed 1000 characters'],
    },
    type: {
      type: String,
      enum: ['system', 'order', 'promo', 'broadcast'],
      default: 'broadcast',
    },
    target: {
      type: String,
      enum: ['all', 'customers', 'sellers', 'students', 'user'],
      default: 'all',
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    clearedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ target: 1, recipient: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
