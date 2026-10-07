const mongoose = require('mongoose');

const webhookEventSchema = new mongoose.Schema(
  {
    event_id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    event_type: {
      type: String,
      required: true,
    },
    payment_id: {
      type: String,
      index: true,
    },
    order_id: {
      type: String,
      index: true,
    },
    payload: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    processed: {
      type: Boolean,
      default: false,
    },
    received_at: {
      type: Date,
      default: Date.now,
    },
    processed_at: {
      type: Date,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

module.exports = mongoose.model('WebhookEvent', webhookEventSchema);
