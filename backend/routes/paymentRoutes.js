const express = require('express');
const router = express.Router();
const {
  createRazorpayOrder,
  verifyPayment,
  handleRazorpayWebhook,
  getPaymentHistory,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');
const { checkoutLimiter } = require('../middleware/rateLimiter');

// Webhook endpoint (must be accessible by Razorpay servers)
router.post('/webhook', handleRazorpayWebhook);

// Protected customer payment routes
router.post('/create-order', protect, checkoutLimiter, createRazorpayOrder);
router.post('/verify', protect, verifyPayment);
router.get('/history', protect, getPaymentHistory);

module.exports = router;
