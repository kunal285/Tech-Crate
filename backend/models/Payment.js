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
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    payment_reference: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    transaction_id: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    gateway: {
      type: String,
      default: 'Razorpay',
    },
    amount: {
      type: Number,
      required: true,
    },
    verified_amount: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    status: {
      type: String,
      enum: [
        'CREATED',
        'PAYMENT_INITIATED',
        'PENDING',
        'VERIFYING',
        'PAID',
        'FAILED',
        'EXPIRED',
        'CANCELLED',
        // Backward-compatible lowercase aliases
        'created',
        'pending',
        'paid',
        'failed',
        'expired',
      ],
      default: 'CREATED',
      index: true,
    },
    verification_source: {
      type: String,
      enum: ['webhook', 'gateway_api', 'admin_manual', 'none'],
      default: 'none',
    },
    verified_at: {
      type: Date,
    },
    idempotency_key: {
      type: String,
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

// Performance compound index
paymentSchema.index({ order_id: 1, status: 1 });
paymentSchema.index({ user: 1, created_at: -1 });

module.exports = mongoose.model('Payment', paymentSchema);
