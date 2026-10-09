const crypto = require('crypto');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
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
 * Supports PayCow standard (timestamp + "." + rawBody), direct rawBody HMAC, and JSON fallback.
 */
const verifyWebhookSignature = (payload, signature, secret, rawBody = null, timestamp = null) => {
  if (!signature || !secret) {
    // In production, an unsigned webhook MUST be rejected
    if (process.env.NODE_ENV === 'production') {
      return false;
    }
    return true;
  }
  try {
    const rawPayload = rawBody
      ? (Buffer.isBuffer(rawBody) ? rawBody.toString('utf8') : String(rawBody))
      : (typeof payload === 'string' ? payload : JSON.stringify(payload));

    const cleanSig = signature.trim().replace(/^v1=/, '');

    // 1. PayCow standard HMAC: timestamp + "." + rawBody
    if (timestamp) {
      const paycowComputed = crypto
        .createHmac('sha256', secret)
        .update(`${timestamp}.${rawPayload}`)
        .digest('hex');
      const sigBuf = Buffer.from(cleanSig);
      const compBuf = Buffer.from(paycowComputed);
      if (sigBuf.length === compBuf.length && crypto.timingSafeEqual(compBuf, sigBuf)) {
        return true;
      }
    }

    // 2. Direct HMAC of raw payload
    const computedDirect = crypto.createHmac('sha256', secret).update(rawPayload).digest('hex');
    const sigBuf = Buffer.from(cleanSig);
    const compDirectBuf = Buffer.from(computedDirect);
    if (sigBuf.length === compDirectBuf.length && crypto.timingSafeEqual(compDirectBuf, sigBuf)) {
      return true;
    }

    // 3. Fallback to JSON.stringify of parsed payload
    const computedJson = crypto.createHmac('sha256', secret).update(JSON.stringify(payload)).digest('hex');
    const compJsonBuf = Buffer.from(computedJson);
    if (sigBuf.length === compJsonBuf.length && crypto.timingSafeEqual(compJsonBuf, sigBuf)) {
      return true;
    }

    return false;
  } catch (err) {
    console.error('[Webhook Signature Verification Error]', err);
    return false;
  }
};

async function finalizePaidOrder(orderRecord, { payment_id, txnId, amount, currency, verificationSource, payload }) {
  if (!orderRecord) {
    return { updatedOrder: null, alreadyProcessed: false };
  }

  if (orderRecord.isPaid) {
    return { updatedOrder: orderRecord, alreadyProcessed: true };
  }

  const rollbackEntries = [];

  for (const item of orderRecord.orderItems || []) {
    if (!item.product || !item.quantity) continue;

    const productId = item.product.toString();
    const quantity = Number(item.quantity) || 1;

    const updatedProduct = await Product.findOneAndUpdate(
      { _id: productId, stock: { $gte: quantity } },
      { $inc: { stock: -quantity } },
      { new: true }
    );

    if (!updatedProduct) {
      for (const rollback of rollbackEntries) {
        await Product.findByIdAndUpdate(rollback.productId, { $inc: { stock: rollback.quantity } }).catch(() => {});
      }
      throw new Error(`Insufficient stock for product ${productId}.`);
    }

    rollbackEntries.push({ productId, quantity });
  }

  const updatedOrder = await Order.findOneAndUpdate(
    { _id: orderRecord._id, isPaid: false },
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

  if (updatedOrder) {
    await Cart.findOneAndUpdate({ user: updatedOrder.user }, { items: [] }).catch(() => {});
  }

  await Payment.findOneAndUpdate(
    { order_id: orderRecord.order_id || orderRecord._id.toString() },
    {
      payment_id,
      order_id: orderRecord.order_id || orderRecord._id.toString(),
      user: orderRecord.user,
      transaction_id: txnId || undefined,
      amount: Number(amount || orderRecord.totalPrice || 0),
      verified_amount: Number(amount || orderRecord.totalPrice || 0),
      currency: currency || orderRecord.currency || 'INR',
      status: 'PAID',
      verification_source: verificationSource || 'webhook',
      verified_at: new Date(),
      gateway_response: payload || {},
    },
    { upsert: true, new: true }
  );

  return { updatedOrder, alreadyProcessed: false };
}

/**
 * 1. Create Payment Order / Payment Intent
 * POST /api/payments/create-order & POST /api/orders/create
 * Strictly relies on DB-calculated Order totalPrice as the single source of truth.
 */
const createPaymentOrder = async (req, res) => {
  try {
    const {
      order_id,
      orderId,
      redirect_url,
      failure_url,
      webhook_url,
      paymentMethod = 'UPI',
    } = req.body;
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
    const finalFailedRedirectUrl =
      failure_url || `${defaultFailedRedirect}?order_id=${targetOrderId}&status=failed`;
    const finalWebhookUrl = webhook_url || globalWebhookUrl;

    // 6. Initialize Gateway Intent
    const autoUpiResponse = await autoUpiService.createOrder({
      orderId: targetOrderId,
      amount: amountInRupees,
      customerName: orderRecord.shippingAddress?.fullName || req.user?.name || 'TechCrate Customer',
      customerEmail: req.user?.email || 'customer@techcrate.com',
      customerMobile: orderRecord.shippingAddress?.phone || req.user?.phone || '9876543210',
      redirectUrl: finalSuccessRedirectUrl,
      failureUrl: finalFailedRedirectUrl,
      webhookUrl: finalWebhookUrl,
    });

    const paymentUrl = autoUpiResponse.paymentUrl || null;

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
          failed_redirect_url: finalFailedRedirectUrl,
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
      is_fallback: autoUpiResponse.isFallback || false,
      quota_exceeded: autoUpiResponse.quotaExceeded || false,
      upi_intent_url: autoUpiResponse.upiIntentUrl,
      qr_data: autoUpiResponse.qrData,
      redirect_url: finalSuccessRedirectUrl,
      failed_redirect_url: finalFailedRedirectUrl,
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

    // Handle new session-based checkout flow
    if (!order && !payment) {
      const CheckoutSession = require('../models/CheckoutSession');
      const session = await CheckoutSession.findOne({
        $or: [...(validMongoId ? [{ _id: validMongoId }] : []), { payment_id: order_id }],
      });

      if (session) {
        if (session.sessionStatus === 'Active') {
          return res.status(200).json({
            success: true,
            status: 'pending',
            isPaid: false,
          });
        }
        
        if (session.sessionStatus === 'Completed' && session.order_id) {
          // If session is completed, we should ideally find the order, but just in case:
          return res.status(200).json({
            success: true,
            status: 'paid',
            isPaid: true,
            final_order_id: session.order_id
          });
        }
      }

      return res.status(404).json({ success: false, message: 'Order, payment, or session record not found.' });
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
    const activeGatewayKey = autoUpiService.apiKey || autoUpiService.userToken;
    if (!isPaid && activeGatewayKey && activeGatewayKey !== 'your_auto_upi_user_token_here') {
      const gatewayQueryId = payment?.gateway_response?.autoUpi?.gatewayOrderId || order_id;
      const autoUpiVerification = await autoUpiService.checkOrderStatus(gatewayQueryId);
      if (autoUpiVerification.isPaid) {
        try {
          const { updatedOrder } = await finalizePaidOrder(order, {
            payment_id: payment?.payment_id || `PAY_${order_id}`,
            txnId: autoUpiVerification.gatewayOrderId || order_id,
            amount: order?.totalPrice || payment?.amount || 0,
            currency: order?.currency || payment?.currency || 'INR',
            verificationSource: 'gateway_api',
            payload: autoUpiVerification.rawResponse || {},
          });

          if (updatedOrder) {
            isPaid = true;
            status = 'paid';
            queueService.dispatchOrderProcessing(updatedOrder, req.user || { _id: order.user });
          }
        } catch (err) {
          console.error('[Gateway Verification Inventory Error]', err.message);
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
      final_order_id: order?.order_id || undefined,
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
      req.headers['paycow-signature'] ||
      req.headers['x-paycow-signature'] ||
      req.headers['x-payment-signature'] ||
      req.headers['x-autoupi-signature'] ||
      req.headers['x-webhook-signature'] ||
      req.headers['x-razorpay-signature'] ||
      req.headers['signature'];
    const timestamp =
      req.headers['paycow-timestamp'] ||
      req.headers['x-paycow-timestamp'] ||
      req.headers['x-timestamp'] ||
      req.body?.timestamp;
    const secret =
      process.env.PAYMENT_WEBHOOK_SECRET ||
      process.env.AUTO_UPI_WEBHOOK_SECRET ||
      process.env.WEBHOOK_SECRET;

    // 1. Cryptographic Signature & Token Verification
    const isValidSignature =
      verifyWebhookSignature(req.body, signature, secret, req.rawBody, timestamp) ||
      autoUpiService.verifyWebhook(req.body, req.headers);

    if (!isValidSignature) {
      console.warn('[Webhook Invalid Signature] Payload signature verification failed.');
      return res.status(401).json({
        success: false,
        message: 'Invalid cryptographic webhook signature or user token.',
      });
    }

    const payload = req.body || {};
    const data = payload.data || payload.result || payload;

    // 2. Timestamp / Freshness Validation — reject stale or replayed events
    const TOLERANCE_SECONDS = Number(process.env.WEBHOOK_TIMESTAMP_TOLERANCE_SECONDS) || 300; // 5 minutes
    const rawTs = timestamp || payload.timestamp || payload.created_at || payload.event_time || null;
    if (rawTs !== null && rawTs !== undefined) {
      let webhookEpochMs;
      if (typeof rawTs === 'number') {
        // Distinguish Unix seconds (10 digits) from Unix milliseconds (13 digits)
        webhookEpochMs = rawTs > 1e12 ? rawTs : rawTs * 1000;
      } else if (!isNaN(Number(rawTs))) {
        const numTs = Number(rawTs);
        webhookEpochMs = numTs > 1e12 ? numTs : numTs * 1000;
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

    const event_type = payload.event || payload.event_type || data.status || payload.status || 'payment.paid';
    const txnId = data.txnId || data.txnid || data.transaction_id || data.utr || payload.txnId || payload.txnid || payload.transaction_id || payload.utr;
    const payment_id = data.payment_id || payload.payment_id || txnId || `PAY_${data.order_id || payload.order_id || Date.now()}`;
    const order_id = data.order_id || data.orderId || payload.order_id || payload.orderId;
    const amount = Number(data.amount || data.totalPrice || payload.amount || payload.totalPrice || 0);
    const currency = data.currency || payload.currency || 'INR';
    const rawStatus = (data.status || payload.status || '').toLowerCase();

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
      
      const CheckoutSession = require('../models/CheckoutSession');
      let session = await CheckoutSession.findOne({
          $or: [...(validMongoId ? [{ _id: validMongoId }] : []), { payment_id: order_id }],
      });
      
      let orderRecord = null;
      let isCheckoutSessionFlow = false;
      let updatedOrder = null;

      if (session && session.sessionStatus === 'Active') {
          isCheckoutSessionFlow = true;
          // Create the Order from session
          const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
          const randomHex = require('crypto').randomBytes(2).toString('hex').toUpperCase();
          const newOrderId = `ORD-${dateStr}-${randomHex}`;
          
          orderRecord = new Order({
              order_id: newOrderId,
              user: session.user,
              orderItems: session.orderItems,
              shippingAddress: session.shippingAddress,
              paymentMethod: session.paymentMethod,
              itemsPrice: session.itemsPrice,
              taxPrice: session.taxPrice,
              shippingPrice: session.shippingPrice,
              totalPrice: session.totalPrice,
              isPaid: true,
              paidAt: new Date(),
              orderStatus: 'Processing',
              paymentResult: {
                  id: txnId || payment_id,
                  status: 'COMPLETED',
                  updateTime: new Date().toISOString()
              }
          });
          
          updatedOrder = await orderRecord.save();
          
          // Mark session completed
          session.sessionStatus = 'Completed';
          session.order_id = updatedOrder.order_id;
          await session.save();
          
          // Clear cart
          await Cart.findOneAndUpdate({ user: orderRecord.user }, { items: [] }).catch(() => {});
          
      } else {
        orderRecord = await Order.findOne({
          $or: [...(validMongoId ? [{ _id: validMongoId }] : []), { order_id }],
        });

        // Fallback: If webhook order_id is the AutoUPI Gateway ID (e.g. ORD...) or slug
        if (!orderRecord) {
          const matchingPayment = await Payment.findOne({
            $or: [
              { 'gateway_response.autoUpi.gatewayOrderId': order_id },
              { 'gateway_response.autoUpi.slug': payload.slug || order_id },
            ],
          });
          if (matchingPayment) {
            const mappedValidId = mongooseValidId(matchingPayment.order_id);
            orderRecord = await Order.findOne({
              $or: [...(mappedValidId ? [{ _id: mappedValidId }] : []), { order_id: matchingPayment.order_id }],
            });
          }
        }
      }

      if (!orderRecord) {
        console.warn(`[Webhook Error] Order/Session ${order_id} not found in database.`);
        return res.status(404).json({ success: false, message: 'Referenced order or session not found.' });
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
          order_id: { $ne: isCheckoutSessionFlow ? orderRecord.order_id : order_id },
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

      // 5. Atomic Order State Transition (PAID -> Processing) - ONLY if legacy flow
      if (!isCheckoutSessionFlow) {
        updatedOrder = await Order.findOneAndUpdate(
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
      }

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

/**
 * XSS escaping helper for server-rendered HTML
 */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * 6. Payment Success Redirect Landing Page
 * GET /payment-success & GET /api/payments/payment-success
 */
const renderPaymentSuccessPage = (req, res) => {
  const orderId = req.query.order_id || req.query.orderId || '';
  const status = req.query.status || 'paid';
  const deepLink = `techcrate://payment/success?order_id=${encodeURIComponent(orderId)}&status=${encodeURIComponent(status)}`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Successful — TechCrate</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    body { background: #0b0f19; color: #f3f4f6; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
    .card { background: #111827; border: 1px solid #1f2937; border-radius: 20px; padding: 40px 32px; max-width: 440px; width: 100%; text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
    .icon-wrapper { width: 80px; height: 80px; background: rgba(16, 185, 129, 0.12); border: 2px solid #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; color: #10b981; font-size: 38px; }
    h1 { font-size: 24px; font-weight: 700; color: #ffffff; margin-bottom: 8px; }
    p.desc { font-size: 14px; color: #9ca3af; margin-bottom: 24px; line-height: 1.5; }
    .detail-box { background: #1a2234; border: 1px solid #2d3748; border-radius: 12px; padding: 16px; margin-bottom: 24px; text-align: left; }
    .detail-row { display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 8px; }
    .detail-row:last-child { margin-bottom: 0; }
    .label { color: #9ca3af; }
    .value { color: #f3f4f6; font-weight: 600; font-family: monospace; }
    .badge-paid { color: #10b981; background: rgba(16, 185, 129, 0.15); padding: 2px 8px; border-radius: 6px; font-weight: 700; }
    .btn { display: block; width: 100%; padding: 14px; border-radius: 10px; font-weight: 600; font-size: 15px; text-decoration: none; cursor: pointer; transition: all 0.2s; border: none; }
    .btn-primary { background: #3b82f6; color: #ffffff; margin-bottom: 12px; }
    .btn-primary:hover { background: #2563eb; }
    .btn-secondary { background: transparent; color: #9ca3af; border: 1px solid #374151; }
    .btn-secondary:hover { color: #ffffff; border-color: #6b7280; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon-wrapper">✓</div>
    <h1>Payment Successful!</h1>
    <p class="desc">Thank you! Your payment has been received and confirmed by TechCrate.</p>
    <div class="detail-box">
      ${orderId ? `<div class="detail-row"><span class="label">Order ID:</span><span class="value">${escapeHtml(orderId)}</span></div>` : ''}
      <div class="detail-row"><span class="label">Status:</span><span class="badge-paid">PAID</span></div>
    </div>
    <a href="${deepLink}" class="btn btn-primary">Open TechCrate App</a>
    <a href="https://tech-crate-tau.vercel.app" class="btn btn-secondary">Go to TechCrate Web</a>
  </div>
  <script>
    if (/android|iphone|ipad|ipod/i.test(navigator.userAgent)) {
      setTimeout(function() { window.location.href = "${deepLink}"; }, 1200);
    }
  </script>
</body>
</html>`;
  res.setHeader('Content-Type', 'text/html');
  return res.send(html);
};

/**
 * 7. Payment Failed / Cancelled Redirect Landing Page
 * GET /payment-failed & GET /api/payments/payment-failed
 */
const renderPaymentFailedPage = (req, res) => {
  const orderId = req.query.order_id || req.query.orderId || '';
  const status = req.query.status || 'failed';
  const deepLink = `techcrate://payment/failed?order_id=${encodeURIComponent(orderId)}&status=${encodeURIComponent(status)}`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Incomplete — TechCrate</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    body { background: #0b0f19; color: #f3f4f6; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
    .card { background: #111827; border: 1px solid #1f2937; border-radius: 20px; padding: 40px 32px; max-width: 440px; width: 100%; text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
    .icon-wrapper { width: 80px; height: 80px; background: rgba(239, 68, 68, 0.12); border: 2px solid #ef4444; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; color: #ef4444; font-size: 38px; }
    h1 { font-size: 24px; font-weight: 700; color: #ffffff; margin-bottom: 8px; }
    p.desc { font-size: 14px; color: #9ca3af; margin-bottom: 24px; line-height: 1.5; }
    .detail-box { background: #1a2234; border: 1px solid #2d3748; border-radius: 12px; padding: 16px; margin-bottom: 24px; text-align: left; }
    .detail-row { display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 8px; }
    .detail-row:last-child { margin-bottom: 0; }
    .label { color: #9ca3af; }
    .value { color: #f3f4f6; font-weight: 600; font-family: monospace; }
    .badge-failed { color: #ef4444; background: rgba(239, 68, 68, 0.15); padding: 2px 8px; border-radius: 6px; font-weight: 700; }
    .btn { display: block; width: 100%; padding: 14px; border-radius: 10px; font-weight: 600; font-size: 15px; text-decoration: none; cursor: pointer; transition: all 0.2s; border: none; }
    .btn-primary { background: #ef4444; color: #ffffff; margin-bottom: 12px; }
    .btn-primary:hover { background: #dc2626; }
    .btn-secondary { background: transparent; color: #9ca3af; border: 1px solid #374151; }
    .btn-secondary:hover { color: #ffffff; border-color: #6b7280; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon-wrapper">✕</div>
    <h1>Payment Cancelled or Failed</h1>
    <p class="desc">The transaction was cancelled or could not be completed. You can try again from the app.</p>
    <div class="detail-box">
      ${orderId ? `<div class="detail-row"><span class="label">Order ID:</span><span class="value">${escapeHtml(orderId)}</span></div>` : ''}
      <div class="detail-row"><span class="label">Status:</span><span class="badge-failed">${escapeHtml(status.toUpperCase())}</span></div>
    </div>
    <a href="${deepLink}" class="btn btn-primary">Return to TechCrate App</a>
    <a href="https://tech-crate-tau.vercel.app" class="btn btn-secondary">Go to TechCrate Web</a>
  </div>
  <script>
    if (/android|iphone|ipad|ipod/i.test(navigator.userAgent)) {
      setTimeout(function() { window.location.href = "${deepLink}"; }, 1200);
    }
  </script>
</body>
</html>`;
  res.setHeader('Content-Type', 'text/html');
  return res.send(html);
};

module.exports = {
  createPaymentOrder,
  getPaymentStatus,
  handlePaymentWebhook,
  reconcilePaymentManual,
  getPaymentHistory,
  renderPaymentSuccessPage,
  renderPaymentFailedPage,
};
