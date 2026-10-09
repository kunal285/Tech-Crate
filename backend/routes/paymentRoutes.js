const express = require('express');
const router = express.Router();
const {
  createPaymentOrder,
  getPaymentStatus,
  handlePaymentWebhook,
  reconcilePaymentManual,
  getPaymentHistory,
  renderPaymentSuccessPage,
  renderPaymentFailedPage,
} = require('../controllers/paymentController');
const { protect, optionalProtect, authorizeRoles } = require('../middleware/authMiddleware');
const { checkoutLimiter } = require('../middleware/rateLimiter');

// 0. Success & Failure Redirect Landing Pages (AutoUPI / PayCow browser redirect)
router.get(['/payment-success', '/success', '/callback'], renderPaymentSuccessPage);
router.get(['/payment-failed', '/failed'], renderPaymentFailedPage);
router.get('/', (req, res, next) => {
  if (req.baseUrl.includes('payment-success')) return renderPaymentSuccessPage(req, res);
  if (req.baseUrl.includes('payment-failed')) return renderPaymentFailedPage(req, res);
  next();
});

// 1. Webhook endpoints (Cryptographically verified via HMAC signature)
router.post('/webhook', handlePaymentWebhook);
router.post('/webhooks/payment', handlePaymentWebhook);
router.post('/payment', handlePaymentWebhook);
router.post('/', handlePaymentWebhook);
router.post('/autoupi/webhook', handlePaymentWebhook);

// 2. Order Payment Initiation endpoints (Strictly protected by authentication & rate limiting)
router.post('/orders/create', protect, checkoutLimiter, createPaymentOrder);
router.post('/create-order', protect, checkoutLimiter, createPaymentOrder);
router.post('/autoupi/create-order', protect, checkoutLimiter, createPaymentOrder);

// 3. Status Verification endpoints (Server-Authoritative Source of Truth)
router.get('/:order_id/status', protect, getPaymentStatus);
router.get('/status/:order_id', protect, getPaymentStatus);
router.post('/verify', protect, getPaymentStatus);

// 4. Admin Privileged Manual Reconciliation (Requires Admin Role & Audit Logging)
router.post('/reconcile', protect, authorizeRoles('admin'), reconcilePaymentManual);

// 5. Payment History
router.get('/history', protect, getPaymentHistory);

module.exports = router;
