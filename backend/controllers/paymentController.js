const crypto = require('crypto');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const WebhookEvent = require('../models/WebhookEvent');
const AuditLog = require('../models/AuditLog');
const autoUpiService = require('../services/autoUpiService');
const queueService = require('../services/queueService');

/**
 * Helper to safely check if string is valid Mongo ObjectId
 */
function mongooseValidId(id) {
  return typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id) ? id : null;
}

/**
 * Helper to compute and verify HMAC SHA-256 signature for Webhooks
 */
const verifyWebhookSignature = (payload, signature, secret) => {
  if (!signature || !secret) {
    // In production, an unsigned webhook MUST be rejected
    if (process.env.NODE_ENV === 'production') {
      return false;
    }
    return true;
  }
  try {
    const rawPayload = typeof payload === 'string' ? payload : JSON.stringify(payload);
    const computed = crypto.createHmac('sha256', secret).update(rawPayload).digest('hex');
    const signatureBuffer = Buffer.from(signature.trim());
    const computedBuffer = Buffer.from(computed.trim());

    if (signatureBuffer.length !== computedBuffer.length) {
      return false;
    }
    return crypto.timingSafeEqual(computedBuffer, signatureBuffer);
  } catch (err) {
    console.error('[Webhook Signature Verification Error]', err);
    return false;
  }
};

/**
 * 1. Create Payment Order / Payment Intent
 * POST /api/payments/create-order & POST /api/orders/create
 * Strictly relies on DB-calculated Order totalPrice as the single source of truth.
 */
const createPaymentOrder = async (req, res) => {
  try {
    const { order_id, orderId, redirect_url, webhook_url, paymentMethod = 'UPI' } = req.body;
    const targetOrderId = order_id || orderId;

    if (!targetOrderId) {
      return res.status(400).json({
        success: false,
        message: 'A valid order_id is required to initiate payment.',
      });
    }

    // 1. Fetch authoritative order from DB
    const validMongoId = mongooseValidId(targetOrderId);
    const orderRecord = await Order.findOne({
      $or: [...(validMongoId ? [{ _id: validMongoId }] : []), { order_id: targetOrderId }],
    });

    if (!orderRecord) {
      return res.status(404).json({
        success: false,
        message: `Order #${targetOrderId} not found in database. Please create the order first.`,
      });
    }

    // 2. IDOR / User Ownership Guard
    if (
      req.user &&
      orderRecord.user &&
      orderRecord.user.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to initiate payment for this order.',
      });
    }

    // 3. State checks
    if (orderRecord.isPaid) {
      return res.status(400).json({
        success: false,
        message: 'This order has already been paid and verified.',
        isPaid: true,
      });
    }

    if (['Cancelled', 'FAILED'].includes(orderRecord.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Cannot initiate payment for an order with status '${orderRecord.orderStatus}'.`,
      });
    }

    // 4. Server-Authoritative Amount (Client cannot dictate amount!)
    const amountInRupees = orderRecord.totalPrice;
    if (amountInRupees <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Payable amount calculated by server must be greater than zero.',
      });
    }

    // 5. Generate cryptographically random, unique Payment Reference
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomHex = crypto.randomBytes(4).toString('hex').toUpperCase();
    const payment_reference = `PAY-${dateStr}-${randomHex}`;
    const payment_id = payment_reference;

    // Resolve URLs
    const defaultSuccessRedirect =
      process.env.PAYMENT_SUCCESS_REDIRECT_URL || 'techcrate://payment/success';
    const defaultFailedRedirect =
      process.env.PAYMENT_FAILED_REDIRECT_URL || 'techcrate://payment/failed';
    const globalWebhookUrl =
      process.env.PAYMENT_GLOBAL_WEBHOOK_URL ||
      `${req.protocol}://${req.get('host')}/api/webhooks/payment`;

    const finalSuccessRedirectUrl =
      redirect_url || `${defaultSuccessRedirect}?order_id=${targetOrderId}&status=paid`;
    const finalWebhookUrl = webhook_url || globalWebhookUrl;

    // 6. Initialize Gateway Intent
    const autoUpiResponse = await autoUpiService.createOrder({
      orderId: targetOrderId,
      amount: amountInRupees,
      customerName: orderRecord.shippingAddress?.fullName || req.user?.name || 'TechCrate Customer',
      customerEmail: req.user?.email || 'customer@techcrate.com',
      customerMobile: orderRecord.shippingAddress?.phone || req.user?.phone || '9876543210',
      redirectUrl: finalSuccessRedirectUrl,
      webhookUrl: finalWebhookUrl,
    });

    const paymentUrl =
      autoUpiResponse.paymentUrl ||
      `https://autoupigateway.com/pay?token=pay_token_${payment_id}&order_id=${targetOrderId}&amount=${amountInRupees}`;

    // 7. Create or update Payment state machine record in DB
    const paymentRecord = await Payment.findOneAndUpdate(
      { order_id: targetOrderId, status: { $ne: 'PAID' } },
      {
        payment_id,
        order_id: targetOrderId,
        user: req.user?._id || orderRecord.user,
        payment_reference,
        gateway: 'AutoUPI',
        amount: amountInRupees,
        currency: orderRecord.currency || 'INR',
        status: 'PAYMENT_INITIATED',
        verification_source: 'none',
        gateway_response: {
          autoUpi: autoUpiResponse,
          redirect_url: finalSuccessRedirectUrl,
          failed_redirect_url: defaultFailedRedirect,
          webhook_url: finalWebhookUrl,
        },
      },
      { upsert: true, new: true }
    );

    return res.status(200).json({
      success: true,
      order_id: targetOrderId,
      payment_id: paymentRecord.payment_id,
      payment_reference: paymentRecord.payment_reference,
      amount: amountInRupees,
      currency: orderRecord.currency || 'INR',
      status: paymentRecord.status,
      payment_url: paymentUrl,
      upi_intent_url: autoUpiResponse.upiIntentUrl,
      qr_data: autoUpiResponse.qrData,
      redirect_url: finalSuccessRedirectUrl,
      webhook_url: finalWebhookUrl,
    });
  } catch (error) {
    console.error('[Create Payment Order Error]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Unable to create payment order.',
    });
  }
};

/**
 * 2. GET Payment Status / Authoritative Verification
 * GET /api/payments/:order_id/status & POST /api/payments/verify
 * Server is the authoritative source for payment status.
 */
const getPaymentStatus = async (req, res) => {
  try {
    const order_id = req.params.order_id || req.params.id || req.body.order_id || req.body.orderId;

    if (!order_id) {
      return res.status(400).json({ success: false, message: 'Order ID is required.' });
    }

    const validMongoId = mongooseValidId(order_id);
    const order = await Order.findOne({
      $or: [...(validMongoId ? [{ _id: validMongoId }] : []), { order_id }],
    });
    const payment = await Payment.findOne({ order_id }).sort({ created_at: -1 });

    if (!order && !payment) {
      return res.status(404).json({ success: false, message: 'Order or payment record not found.' });
    }

    // IDOR check: If user is authenticated, ensure they own the order
    if (
      req.user &&
      order &&
      order.user &&
      order.user.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to view payment status for this order.',
      });
    }

    let isPaid = Boolean(order?.isPaid || payment?.status === 'PAID' || payment?.status === 'paid');
    let rawStatus = isPaid
      ? 'paid'
      : payment?.status ||
        (order?.orderStatus === 'FAILED'
          ? 'failed'
          : order?.orderStatus === 'Cancelled'
          ? 'cancelled'
          : 'pending');
    let status = String(rawStatus).toLowerCase();

    // Re-verify with external gateway if not marked as paid yet
    if (!isPaid && autoUpiService.userToken && autoUpiService.userToken !== 'your_auto_upi_user_token_here') {
      const autoUpiVerification = await autoUpiService.checkOrderStatus(order_id);
      if (autoUpiVerification.isPaid) {
        // Atomic transition to prevent race conditions
        const updatedOrder = await Order.findOneAndUpdate(
          { _id: order._id, isPaid: false },
          { isPaid: true, paidAt: new Date(), orderStatus: 'Processing' },
          { new: true }
        );

        if (updatedOrder) {
          isPaid = true;
          status = 'paid';

          if (payment) {
            payment.status = 'PAID';
            payment.verified_amount = order.totalPrice;
            payment.verified_at = new Date();
            payment.verification_source = 'gateway_api';
            await payment.save();
          }

          // Asynchronously trigger fulfillment queue
          queueService.dispatchOrderProcessing(updatedOrder, req.user || { _id: order.user });
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
      verification_source: payment?.verification_source || (isPaid ? 'server_verified' : 'none'),
      updated_at: order?.updatedAt || new Date(),
    });
  } catch (error) {
    console.error('[Get Payment Status Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while checking payment status.',
    });
  }
};

/**
 * 3. Secure Webhook Handler
 * POST /api/webhooks/payment & POST /api/payments/webhook
 * Idempotent, signature-verified, replay-protected payment.paid processor.
 */
const handlePaymentWebhook = async (req, res) => {
  try {
    const signature =
      req.headers['x-payment-signature'] ||
      req.headers['x-autoupi-signature'] ||
      req.headers['x-webhook-signature'] ||
      req.headers['x-razorpay-signature'];
    const secret =
      process.env.PAYMENT_WEBHOOK_SECRET ||
      process.env.AUTO_UPI_WEBHOOK_SECRET ||
      process.env.WEBHOOK_SECRET;

    // 1. Cryptographic Signature Verification
    const isValidSignature = verifyWebhookSignature(req.body, signature, secret);
    if (!isValidSignature) {
      console.warn('[Webhook Invalid Signature] Payload signature verification failed.');
      return res.status(401).json({
        success: false,
        message: 'Invalid cryptographic webhook signature.',
      });
    }

    const payload = req.body || {};

    // 2. Timestamp / Freshness Validation — reject stale or replayed events
    const TOLERANCE_SECONDS = Number(process.env.WEBHOOK_TIMESTAMP_TOLERANCE_SECONDS) || 300; // 5 minutes
    const rawTs = payload.timestamp || payload.created_at || payload.event_time || null;
    if (rawTs !== null && rawTs !== undefined) {
      let webhookEpochMs;
      if (typeof rawTs === 'number') {
        // Distinguish Unix seconds (10 digits) from Unix milliseconds (13 digits)
        webhookEpochMs = rawTs > 1e12 ? rawTs : rawTs * 1000;
      } else {
        // ISO-8601 or other parseable date string
        webhookEpochMs = new Date(rawTs).getTime();
      }

      if (isNaN(webhookEpochMs)) {
        console.warn(`[Webhook Timestamp Warning] Unparseable timestamp field: ${rawTs}`);
      } else {
        const ageSeconds = (Date.now() - webhookEpochMs) / 1000;
        if (ageSeconds > TOLERANCE_SECONDS) {
          console.warn(
            `[Webhook Replay Blocked] Event is ${Math.round(ageSeconds)}s old — exceeds ${TOLERANCE_SECONDS}s tolerance.`
          );
          return res.status(408).json({
            success: false,
            message: `Webhook event is too old (${Math.round(ageSeconds)}s). Requests must arrive within ${TOLERANCE_SECONDS}s of their timestamp.`,
          });
        }
        if (ageSeconds < -60) {
          // Clock skew > 60 s into the future — reject as malformed
          console.warn(`[Webhook Clock Skew] Event timestamp is ${Math.abs(Math.round(ageSeconds))}s in the future.`);
          return res.status(400).json({
            success: false,
            message: 'Webhook event timestamp is in the future. Possible clock skew or replay.',
          });
        }
      }
    } else {
      // Gateway did not include a timestamp — proceed but log for monitoring
      console.warn('[Webhook No Timestamp] Payload contains no timestamp field. Freshness cannot be verified.');
    }

    const event_type = payload.event || payload.event_type || payload.status || 'payment.paid';
    const txnId = payload.txnId || payload.txnid || payload.transaction_id || payload.utr;
    const payment_id = payload.payment_id || txnId || `PAY_${payload.order_id || Date.now()}`;
    const order_id = payload.order_id || payload.orderId;
    const amount = Number(payload.amount || payload.totalPrice || 0);
    const currency = payload.currency || 'INR';
    const rawStatus = (payload.status || '').toLowerCase();

    if (!order_id) {
      return res.status(400).json({ success: false, message: 'Missing order_id in webhook payload.' });
    }

    const event_id =
      payload.event_id || `EVT_${order_id}_${txnId || payment_id}_${event_type}_${rawStatus}`;

    // 2. Idempotency Guard - Avoid duplicate processing
    const existingEvent = await WebhookEvent.findOne({ event_id });
    if (existingEvent && existingEvent.processed) {
      console.log(`[Webhook Idempotency Skip] Event ${event_id} has already been processed.`);
      return res.status(200).json({
        success: true,
        message: 'Webhook event already processed (Idempotent execution).',
        processed: true,
        event_id,
      });
    }

    let webhookRecord =
      existingEvent ||
      new WebhookEvent({
        event_id,
        event_type,
        payment_id,
        order_id,
        payload,
        processed: false,
        received_at: new Date(),
      });

    const isPaidEvent =
      event_type === 'payment.paid' ||
      rawStatus === 'paid' ||
      rawStatus === 'completed' ||
      rawStatus === 'success';

    if (isPaidEvent) {
      const validMongoId = mongooseValidId(order_id);
      const orderRecord = await Order.findOne({
        $or: [...(validMongoId ? [{ _id: validMongoId }] : []), { order_id }],
      });

      if (!orderRecord) {
        console.warn(`[Webhook Error] Order ${order_id} not found in database.`);
        return res.status(404).json({ success: false, message: 'Referenced order not found.' });
      }

      // 3. Amount Validation (Protection against amount tampering)
      if (amount > 0 && Math.abs(orderRecord.totalPrice - amount) > 0.01) {
        console.error(
          `[Webhook Security Alert] Amount mismatch for order ${order_id}: expected ₹${orderRecord.totalPrice}, received ₹${amount}`
        );
        return res.status(400).json({
          success: false,
          message: 'Payment amount mismatch between order and webhook.',
        });
      }

      // 4. Replay Attack Protection: Ensure transaction ID was not used by another order
      if (txnId) {
        const duplicatePayment = await Payment.findOne({
          transaction_id: txnId,
          order_id: { $ne: order_id },
          status: { $in: ['PAID', 'paid'] },
        });

        if (duplicatePayment) {
          console.error(
            `[Webhook Replay Attack Alert] Transaction ${txnId} already consumed by order ${duplicatePayment.order_id}`
          );
          return res.status(409).json({
            success: false,
            message: 'Transaction reference has already been consumed by another order.',
          });
        }
      }

      // 5. Atomic Order State Transition (PAID -> Processing)
      const updatedOrder = await Order.findOneAndUpdate(
        {
          $or: [...(validMongoId ? [{ _id: validMongoId }] : []), { order_id }],
          isPaid: false,
        },
        {
          isPaid: true,
          paidAt: new Date(),
          orderStatus: 'Processing',
          paymentResult: {
            id: txnId || payment_id,
            status: 'COMPLETED',
            updateTime: new Date().toISOString(),
          },
        },
        { new: true }
      );

      // 6. Update or Create Payment Model
      await Payment.findOneAndUpdate(
        { order_id },
        {
          payment_id,
          order_id,
          user: orderRecord.user,
          transaction_id: txnId || undefined,
          amount: orderRecord.totalPrice,
          verified_amount: amount || orderRecord.totalPrice,
          currency,
          status: 'PAID',
          verification_source: 'webhook',
          verified_at: new Date(),
          gateway_response: payload,
        },
        { upsert: true, new: true }
      );

      // 7. Mark WebhookEvent as processed (Atomic upsert prevents race conditions)
      await WebhookEvent.findOneAndUpdate(
        { event_id },
        {
          $set: {
            event_type,
            payment_id,
            order_id,
            payload,
            processed: true,
            processed_at: new Date(),
          },
          $setOnInsert: { received_at: new Date() },
        },
        { upsert: true }
      ).catch(() => {});

      // 8. Dispatch fulfillment only on first successful state change
      if (updatedOrder) {
        console.log(`[Webhook Success] Order ${order_id} marked as PAID via verified webhook.`);
        queueService.dispatchOrderProcessing(updatedOrder, { _id: updatedOrder.user });
      }

      return res.status(200).json({
        success: true,
        message: 'Webhook processed successfully. Order verified and marked as PAID.',
        order_id,
        payment_id,
        event_id,
      });
    }

    // Handle failed / expired webhook events
    if (rawStatus === 'failed' || rawStatus === 'expired') {
      const validMongoId = mongooseValidId(order_id);
      await Payment.findOneAndUpdate({ order_id }, { status: 'FAILED' });
      await Order.findOneAndUpdate(
        { $or: [...(validMongoId ? [{ _id: validMongoId }] : []), { order_id }], isPaid: false },
        { orderStatus: 'FAILED' }
      );
      await WebhookEvent.findOneAndUpdate(
        { event_id },
        {
          $set: {
            event_type,
            payment_id,
            order_id,
            payload,
            processed: true,
            processed_at: new Date(),
          },
          $setOnInsert: { received_at: new Date() },
        },
        { upsert: true }
      ).catch(() => {});
    }

    return res.status(200).json({
      success: true,
      message: 'Webhook event received.',
      event_id,
    });
  } catch (error) {
    console.error('[Webhook Processing Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while processing webhook.',
    });
  }
};

/**
 * 4. Manual Payment Reconciliation (Admin Only Privileged Action)
 * POST /api/payments/reconcile
 */
const reconcilePaymentManual = async (req, res) => {
  try {
    const { order_id, transaction_id, amount, reason } = req.body;

    if (!order_id || !transaction_id || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Order ID, unique transaction ID (UTR/Bank Ref), and reconciliation reason are required.',
      });
    }

    const validMongoId = mongooseValidId(order_id);
    const order = await Order.findOne({
      $or: [...(validMongoId ? [{ _id: validMongoId }] : []), { order_id }],
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (order.isPaid) {
      return res.status(400).json({ success: false, message: 'Order is already marked as paid.' });
    }

    // Replay check
    const existingTxn = await Payment.findOne({
      transaction_id,
      order_id: { $ne: order_id },
      status: { $in: ['PAID', 'paid'] },
    });

    if (existingTxn) {
      return res.status(409).json({
        success: false,
        message: `Transaction ID '${transaction_id}' is already assigned to Order #${existingTxn.order_id}.`,
      });
    }

    // Atomic update
    const updatedOrder = await Order.findOneAndUpdate(
      { _id: order._id, isPaid: false },
      {
        isPaid: true,
        paidAt: new Date(),
        orderStatus: 'Processing',
        paymentResult: {
          id: transaction_id,
          status: 'MANUAL_RECONCILED',
          updateTime: new Date().toISOString(),
        },
      },
      { new: true }
    );

    await Payment.findOneAndUpdate(
      { order_id },
      {
        payment_id: `PAY_MANUAL_${Date.now()}`,
        order_id,
        user: order.user,
        transaction_id,
        amount: order.totalPrice,
        verified_amount: Number(amount) || order.totalPrice,
        status: 'PAID',
        verification_source: 'admin_manual',
        verified_at: new Date(),
      },
      { upsert: true, new: true }
    );

    // Save Audit Log
    await AuditLog.create({
      actor: req.user._id,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      action: 'MANUAL_PAYMENT_RECONCILE',
      targetType: 'Payment',
      targetId: String(order._id),
      previousState: { isPaid: false, orderStatus: order.orderStatus },
      newState: { isPaid: true, orderStatus: 'Processing', transaction_id, reason },
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent') || 'Admin Panel',
    });

    // Dispatch fulfillment
    if (updatedOrder) {
      queueService.dispatchOrderProcessing(updatedOrder, { _id: updatedOrder.user });
    }

    return res.status(200).json({
      success: true,
      message: 'Payment manually reconciled and order marked as PAID.',
      order: updatedOrder,
    });
  } catch (error) {
    console.error('[Manual Payment Reconciliation Error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 5. Get Payment History (Authenticated User)
 * GET /api/payments/history
 */
const getPaymentHistory = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id, isPaid: true }).sort({ createdAt: -1 });
    const payments = orders.map((o) => ({
      orderId: o.order_id || o._id,
      trackingNumber: o.trackingNumber,
      amount: o.totalPrice,
      paymentMethod: o.paymentMethod || 'UPI',
      paymentGateway: 'Auto UPI Gateway / UPI Direct',
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
  reconcilePaymentManual,
  getPaymentHistory,
};
