const crypto = require('crypto');
const Order = require('../models/Order');
const { logAdminAction } = require('../services/auditService');

/**
 * 1. Create Razorpay Order Intent
 * POST /api/payments/create-order
 */
const createRazorpayOrder = async (req, res) => {
  try {
    const { amount, orderId, currency = 'INR' } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Valid amount is required.' });
    }

    const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_TechCrate2026';
    const amountInPaise = Math.round(Number(amount) * 100);

    // If orderId is provided, verify it belongs to the authenticated user
    if (orderId) {
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found.' });
      }
      if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Not authorized for this order.' });
      }
    }

    // Generate Razorpay Order
    // In production with live keys, can call razorpayInstance.orders.create(...)
    const mockOrderId = `order_${crypto.randomBytes(8).toString('hex')}`;

    return res.status(200).json({
      success: true,
      id: mockOrderId,
      amount: amountInPaise,
      currency,
      key_id: keyId,
      orderId: orderId || null,
      status: 'created',
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Create Payment Order Error]', error);
    return res.status(500).json({ success: false, message: 'Unable to initialize payment session.' });
  }
};

/**
 * 2. Verify Payment on Backend via HMAC Signature
 * POST /api/payments/verify
 */
const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id) {
      return res.status(400).json({
        success: false,
        message: 'Missing required payment verification parameters.',
      });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET || 'test_secret_techcrate_2026';

    // Verify HMAC-SHA256 signature if signature provided
    let isSignatureValid = false;
    if (razorpay_signature) {
      const generatedSignature = crypto
        .createHmac('sha256', secret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      isSignatureValid = generatedSignature === razorpay_signature;
      // In sandbox mode or mock test, accept verified test signatures
      if (!isSignatureValid && process.env.NODE_ENV !== 'production' && razorpay_signature === 'mock_valid_signature') {
        isSignatureValid = true;
      }
    } else if (process.env.NODE_ENV !== 'production') {
      // Allow seamless fallback in non-production environments when keys are empty
      isSignatureValid = true;
    }

    if (!isSignatureValid) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed: Invalid cryptographic signature.',
      });
    }

    // Update Order if orderId provided
    let updatedOrder = null;
    if (orderId) {
      updatedOrder = await Order.findById(orderId);
      if (updatedOrder) {
        updatedOrder.isPaid = true;
        updatedOrder.paidAt = new Date();
        updatedOrder.orderStatus = 'Processing';
        await updatedOrder.save();
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully and recorded on backend.',
      payment: {
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        verifiedAt: new Date().toISOString(),
        order: updatedOrder,
      },
    });
  } catch (error) {
    console.error('[Verify Payment Error]', error);
    return res.status(500).json({ success: false, message: 'Server error during payment verification.' });
  }
};

/**
 * 3. Webhook Handler
 * POST /api/payments/webhook
 */
const handleRazorpayWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'webhook_secret_techcrate_2026';

    if (signature) {
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(JSON.stringify(req.body))
        .digest('hex');

      if (expectedSignature !== signature) {
        return res.status(400).json({ status: 'Invalid webhook signature' });
      }
    }

    const event = req.body?.event;
    console.log(`[Razorpay Webhook Event] ${event}`);

    return res.status(200).json({ status: 'ok', received: true });
  } catch (error) {
    console.error('[Webhook Error]', error);
    return res.status(500).json({ status: 'error' });
  }
};

/**
 * 4. Get Payment History
 * GET /api/payments/history
 */
const getPaymentHistory = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id, isPaid: true }).sort({ createdAt: -1 });
    const payments = orders.map((o) => ({
      orderId: o._id,
      trackingNumber: o.trackingNumber,
      amount: o.totalPrice,
      paymentMethod: o.paymentMethod,
      paidAt: o.paidAt || o.createdAt,
      status: 'Captured',
    }));

    return res.status(200).json(payments);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to retrieve payment history.' });
  }
};

module.exports = {
  createRazorpayOrder,
  verifyPayment,
  handleRazorpayWebhook,
  getPaymentHistory,
};
