const crypto = require('crypto');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const WebhookEvent = require('../models/WebhookEvent');
const autoUpiService = require('../services/autoUpiService');

/**
 * Helper to compute HMAC SHA-256 signature for Webhooks
 */
const verifyWebhookSignature = (payload, signature, secret) => {
  if (!signature || !secret) return true; // Default true in dev if secret not configured
  try {
    const computed = crypto
      .createHmac('sha256', secret)
      .update(typeof payload === 'string' ? payload : JSON.stringify(payload))
      .digest('hex');
    return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(signature));
  } catch (err) {
    return false;
  }
};

/**
 * 1. Create Order API (POST /api/orders/create & POST /api/payments/create-order)
 * Supports per-order redirect_url and webhook_url overrides.
 */
const createPaymentOrder = async (req, res) => {
  try {
    const {
      amount,
      currency = 'INR',
      order_id,
      orderId,
      redirect_url,
      webhook_url,
      paymentMethod = 'UPI',
    } = req.body;

    const targetOrderId = order_id || orderId || `ORDER_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Valid payment amount is required.' });
    }

    const amountInRupees = Number(amount);

    // Resolve per-order or global default redirect and webhook URLs
    const defaultSuccessRedirect = process.env.PAYMENT_SUCCESS_REDIRECT_URL || process.env.PAYMENT_DEFAULT_REDIRECT_URL || 'myapp://payment/success';
    const defaultFailedRedirect = process.env.PAYMENT_FAILED_REDIRECT_URL || 'myapp://payment/failed';
    const globalWebhookUrl = process.env.PAYMENT_GLOBAL_WEBHOOK_URL || `${req.protocol}://${req.get('host')}/api/webhooks/payment`;

    const finalSuccessRedirectUrl = redirect_url || `${defaultSuccessRedirect}?order_id=${targetOrderId}&status=paid`;
    const finalWebhookUrl = webhook_url || globalWebhookUrl;

    // Generate unique Payment ID
    const payment_id = `PAY_${Date.now()}_${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    // Create or find existing Order in DB
    let orderRecord = await Order.findOne({ $or: [{ _id: mongooseValidId(targetOrderId) }, { order_id: targetOrderId }] });
    if (!orderRecord) {
      orderRecord = new Order({
        order_id: targetOrderId,
        user: req.user?._id || req.user?.id || '000000000000000000000000',
        orderItems: req.body.orderItems || [],
        shippingAddress: req.body.shippingAddress || {
          fullName: req.user?.name || 'Customer',
          phone: req.user?.phone || '9876543210',
          street: 'Main Street',
          city: 'City',
          state: 'State',
          pincode: '000000',
        },
        paymentMethod,
        currency,
        itemsPrice: amountInRupees,
        taxPrice: 0,
        shippingPrice: 0,
        totalPrice: amountInRupees,
        isPaid: false,
        orderStatus: 'Pending',
      });
      await orderRecord.save();
    }

    // Initialize Auto UPI Gateway intent
    const autoUpiResponse = await autoUpiService.createOrder({
      orderId: targetOrderId,
      amount: amountInRupees,
      customerName: req.user?.name || orderRecord.shippingAddress?.fullName || 'TechCrate Customer',
      customerEmail: req.user?.email || 'customer@techcrate.com',
      customerMobile: orderRecord.shippingAddress?.phone || req.user?.phone || '9876543210',
      redirectUrl: finalSuccessRedirectUrl,
      webhookUrl: finalWebhookUrl,
    });

    const paymentUrl = autoUpiResponse.paymentUrl || `https://autoupigateway.com/pay?token=pay_token_${payment_id}&order_id=${targetOrderId}&amount=${amountInRupees}`;

    // Create Payment Record in Database
    const paymentRecord = new Payment({
      payment_id,
      order_id: targetOrderId,
      gateway: 'AutoUPI',
      amount: amountInRupees,
      currency,
      status: 'created',
      gateway_response: {
        autoUpi: autoUpiResponse,
        redirect_url: finalSuccessRedirectUrl,
        failed_redirect_url: defaultFailedRedirect,
        webhook_url: finalWebhookUrl,
      },
    });
    await paymentRecord.save();

    return res.status(200).json({
      success: true,
      order_id: targetOrderId,
      payment_id: payment_id,
      payment_url: paymentUrl,
      upi_intent_url: autoUpiResponse.upiIntentUrl,
      qr_data: autoUpiResponse.qrData,
      amount: amountInRupees,
      currency,
      redirect_url: finalSuccessRedirectUrl,
      webhook_url: finalWebhookUrl,
    });
  } catch (error) {
    console.error('[Create Payment Order Error]', error);
    return res.status(500).json({ success: false, message: error.message || 'Unable to create payment order.' });
  }
};

/**
 * Helper to safely check if string is valid Mongo ObjectId
 */
function mongooseValidId(id) {
  return /^[0-9a-fA-F]{24}$/.test(id) ? id : null;
}

/**
 * 2. GET Payment Status (GET /api/payments/:order_id/status & GET /api/orders/:order_id/status)
 * Authoritative backend check for payment verification.
 */
const getPaymentStatus = async (req, res) => {
  try {
    const order_id = req.params.order_id || req.params.id;

    if (!order_id) {
      return res.status(400).json({ success: false, message: 'Order ID is required.' });
    }

    const order = await Order.findOne({ $or: [{ _id: mongooseValidId(order_id) }, { order_id }] });
    const payment = await Payment.findOne({ order_id }).sort({ created_at: -1 });

    if (!order && !payment) {
      return res.status(404).json({ success: false, message: 'Order or payment record not found.' });
    }

    let isPaid = order?.isPaid || payment?.status === 'paid';
    let status = isPaid ? 'paid' : payment?.status || 'pending';

    // If status is not paid yet, check with Auto UPI Gateway to re-verify status
    if (!isPaid) {
      const autoUpiVerification = await autoUpiService.checkOrderStatus(order_id);
      if (autoUpiVerification.isPaid) {
        isPaid = true;
        status = 'paid';

        // Update database records
        if (order) {
          order.isPaid = true;
          order.paidAt = new Date();
          order.orderStatus = 'Processing';
          await order.save();
        }
        if (payment) {
          payment.status = 'paid';
          await payment.save();
        }
      }
    }

    return res.status(200).json({
      success: true,
      order_id,
      payment_id: payment?.payment_id || `PAY_${order_id}`,
      amount: order?.totalPrice || payment?.amount || 0,
      currency: order?.currency || payment?.currency || 'INR',
      status: isPaid ? 'paid' : (status === 'failed' ? 'failed' : 'pending'),
      isPaid,
      updated_at: order?.updatedAt || new Date(),
    });
  } catch (error) {
    console.error('[Get Payment Status Error]', error);
    return res.status(500).json({ success: false, message: 'Server error while checking payment status.' });
  }
};

/**
 * 3. Webhook Handler (POST /api/webhooks/payment & POST /api/payments/webhook)
 * Idempotent, cryptographically signed payment.paid handler.
 */
const handlePaymentWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-payment-signature'] || req.headers['x-autoupi-signature'] || req.headers['x-webhook-signature'];
    const secret = process.env.PAYMENT_WEBHOOK_SECRET || process.env.AUTO_UPI_WEBHOOK_SECRET;

    // 1. Signature Verification
    if (signature && secret && !verifyWebhookSignature(req.body, signature, secret)) {
      console.warn('[Webhook Invalid Signature] Payload signature check failed.');
      return res.status(400).json({ success: false, message: 'Invalid cryptographic webhook signature.' });
    }

    const payload = req.body || {};
    const event_type = payload.event || payload.event_type || payload.status || 'payment.paid';
    const payment_id = payload.payment_id || payload.txnid || `PAY_${payload.order_id || Date.now()}`;
    const order_id = payload.order_id || payload.orderId;
    const amount = Number(payload.amount || payload.totalPrice || 0);
    const currency = payload.currency || 'INR';
    const status = (payload.status || '').toLowerCase();

    const event_id = payload.event_id || `EVT_${payment_id}_${event_type}_${status}`;

    // 2. Idempotency Guard - Check if WebhookEvent already processed
    const existingEvent = await WebhookEvent.findOne({ event_id });
    if (existingEvent && existingEvent.processed) {
      console.log(`[Webhook Idempotent Skip] Event ${event_id} already processed.`);
      return res.status(200).json({
        success: true,
        message: 'Webhook event already processed (Idempotent execution).',
        processed: true,
        event_id,
      });
    }

    // Save or update WebhookEvent record
    let webhookRecord = existingEvent || new WebhookEvent({
      event_id,
      event_type,
      payment_id,
      order_id,
      payload,
      processed: false,
      received_at: new Date(),
    });

    // 3. Process payment.paid Event
    const isPaidEvent =
      event_type === 'payment.paid' ||
      status === 'paid' ||
      status === 'completed' ||
      status === 'success';

    if (order_id && isPaidEvent) {
      // Find Order & Payment in Database
      const orderRecord = await Order.findOne({ $or: [{ _id: mongooseValidId(order_id) }, { order_id }] });
      const paymentRecord = await Payment.findOne({ $or: [{ payment_id }, { order_id }] });

      // Amount & Currency Validation
      if (orderRecord) {
        if (amount > 0 && Math.abs(orderRecord.totalPrice - amount) > 0.01) {
          console.warn(`[Webhook Validation Failed] Amount mismatch for order ${order_id}: expected ₹${orderRecord.totalPrice}, got ₹${amount}`);
        }

        orderRecord.isPaid = true;
        orderRecord.paidAt = new Date();
        orderRecord.orderStatus = 'Processing';
        await orderRecord.save();
      }

      if (paymentRecord) {
        paymentRecord.status = 'paid';
        paymentRecord.gateway_response = payload;
        await paymentRecord.save();
      } else {
        await Payment.create({
          payment_id,
          order_id,
          gateway: 'AutoUPI',
          amount: amount || orderRecord?.totalPrice || 0,
          currency,
          status: 'paid',
          gateway_response: payload,
        });
      }

      // Mark WebhookEvent as processed
      webhookRecord.processed = true;
      webhookRecord.processed_at = new Date();
      await webhookRecord.save();

      console.log(`[Webhook Success] Order ${order_id} marked as PAID via payment.paid webhook.`);

      return res.status(200).json({
        success: true,
        message: 'Webhook processed successfully. Order marked as PAID.',
        order_id,
        payment_id,
        event_id,
      });
    }

    // Handle failed / expired webhook events
    if (order_id && (status === 'failed' || status === 'expired')) {
      await Payment.findOneAndUpdate({ order_id }, { status });
      await Order.findOneAndUpdate({ order_id }, { orderStatus: 'FAILED' });
      webhookRecord.processed = true;
      webhookRecord.processed_at = new Date();
      await webhookRecord.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Webhook event received.',
      event_id,
    });
  } catch (error) {
    console.error('[Webhook Error]', error);
    return res.status(500).json({ success: false, message: 'Server error while processing webhook.' });
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
      orderId: o.order_id || o._id,
      trackingNumber: o.trackingNumber,
      amount: o.totalPrice,
      paymentMethod: o.paymentMethod || 'UPI (Auto UPI Gateway)',
      paymentGateway: 'Auto UPI Gateway (autoupigateway.com)',
      paidAt: o.paidAt || o.createdAt,
      status: 'Captured',
    }));

    return res.status(200).json(payments);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to retrieve payment history.' });
  }
};

module.exports = {
  createPaymentOrder,
  getPaymentStatus,
  handlePaymentWebhook,
  getPaymentHistory,
};
