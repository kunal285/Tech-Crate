const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    payment_id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    order_id: {
      type: String,
      required: true,
      index: true,
    },
    gateway: {
      type: String,
      default: 'AutoUPI',
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    status: {
      type: String,
      enum: ['created', 'pending', 'paid', 'failed', 'expired'],
      default: 'created',
      index: true,
    },
    gateway_response: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

module.exports = mongoose.model('Payment', paymentSchema);
