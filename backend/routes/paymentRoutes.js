const express = require('express');
const router = express.Router();
const {
  createPaymentOrder,
  getPaymentStatus,
  handlePaymentWebhook,
  getPaymentHistory,
} = require('../controllers/paymentController');
const { protect, optionalProtect } = require('../middleware/authMiddleware');
const { checkoutLimiter } = require('../middleware/rateLimiter');

// Webhook endpoints (accessible by Gateway & External Webhook Senders)
router.post('/webhook', handlePaymentWebhook);
router.post('/webhooks/payment', handlePaymentWebhook);
router.post('/autoupi/webhook', handlePaymentWebhook);

// Order Creation endpoints
router.post('/orders/create', optionalProtect, checkoutLimiter, createPaymentOrder);
router.post('/create-order', optionalProtect, checkoutLimiter, createPaymentOrder);
router.post('/autoupi/create-order', optionalProtect, checkoutLimiter, createPaymentOrder);

// Status Verification endpoints (Server-side Source of Truth)
router.get('/:order_id/status', optionalProtect, getPaymentStatus);
router.get('/status/:order_id', optionalProtect, getPaymentStatus);
router.post('/verify', optionalProtect, getPaymentStatus);

// Payment History
router.get('/history', protect, getPaymentHistory);

module.exports = router;
