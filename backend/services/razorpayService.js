const Razorpay = require('razorpay');
const crypto = require('crypto');

class RazorpayService {
  constructor() {
    this.keyId = process.env.RAZORPAY_KEY_ID || '';
    this.keySecret = process.env.RAZORPAY_KEY_SECRET || '';
    this.webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || '';

    this.isLive =
      Boolean(this.keyId) &&
      Boolean(this.keySecret) &&
      !this.keyId.includes('your_key') &&
      !this.keySecret.includes('your_razorpay') &&
      (this.keyId.startsWith('rzp_test_') || this.keyId.startsWith('rzp_live_'));

    if (this.isLive) {
      try {
        this.instance = new Razorpay({
          key_id: this.keyId,
          key_secret: this.keySecret,
        });
      } catch (err) {
        console.error('[Razorpay Initialization Error]', err.message);
        this.isLive = false;
      }
    }
  }

  /**
   * Create a Razorpay Order (server-side)
   * Amount must be in paise (INR × 100)
   * @returns {Promise<Object>} Razorpay order details
   */
  async createOrder({ orderId, amount, currency = 'INR', notes = {} }) {
    const amountInPaise = Math.round(Number(amount) * 100);

    if (!this.isLive) {
      console.log('[Razorpay] Sandbox mode — returning mock order.');
      return {
        success: true,
        isSandbox: true,
        razorpay_order_id: `order_sandbox_${orderId || Date.now()}`,
        amount: amountInPaise,
        currency,
        key_id: this.keyId || 'rzp_test_sandbox',
        receipt: String(orderId),
        status: 'created',
      };
    }

    try {
      const order = await this.instance.orders.create({
        amount: amountInPaise,
        currency,
        receipt: String(orderId).slice(0, 40), // Razorpay receipt max 40 chars
        notes: {
          session_id: String(orderId),
          ...notes,
        },
        payment_capture: 1, // Auto-capture
      });

      return {
        success: true,
        isSandbox: false,
        razorpay_order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        key_id: this.keyId,
        receipt: order.receipt,
        status: order.status,
      };
    } catch (err) {
      console.error('[Razorpay createOrder Error]', err);
      throw new Error(err?.error?.description || err?.message || 'Failed to create Razorpay order.');
    }
  }

  /**
   * Verify Razorpay payment signature (client-side payment verification)
   * Signature = HMAC-SHA256(razorpay_order_id + "|" + razorpay_payment_id, key_secret)
   */
  verifyPaymentSignature({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) {
    const secret = this.keySecret || process.env.RAZORPAY_KEY_SECRET || '';
    if (!secret) {
      console.warn('[Razorpay] Key secret not configured — skipping signature verification.');
      return process.env.NODE_ENV !== 'production';
    }
    if (!razorpay_signature) return false;

    try {
      const body = `${razorpay_order_id}|${razorpay_payment_id}`;
      const expected = crypto
        .createHmac('sha256', secret)
        .update(body)
        .digest('hex');
      const expectedBuf = Buffer.from(expected);
      const signatureBuf = Buffer.from(razorpay_signature || '');
      if (expectedBuf.length !== signatureBuf.length) {
        return false;
      }
      return crypto.timingSafeEqual(expectedBuf, signatureBuf);
    } catch {
      return false;
    }
  }

  /**
   * Verify Razorpay webhook signature
   * Header: X-Razorpay-Signature
   * Signature = HMAC-SHA256(rawBody, webhook_secret)
   */
  verifyWebhookSignature(rawBody, signature) {
    const secret = this.webhookSecret || process.env.RAZORPAY_WEBHOOK_SECRET || '';
    if (!secret) {
      console.warn('[Razorpay Webhook] RAZORPAY_WEBHOOK_SECRET not set.');
      return process.env.NODE_ENV !== 'production';
    }
    if (!signature) return false;

    try {
      const body = Buffer.isBuffer(rawBody) ? rawBody.toString('utf8') : String(rawBody);
      const expected = crypto
        .createHmac('sha256', secret)
        .update(body)
        .digest('hex');
      const expectedBuf = Buffer.from(expected);
      const signatureBuf = Buffer.from(signature);
      if (expectedBuf.length !== signatureBuf.length) {
        return false;
      }
      return crypto.timingSafeEqual(expectedBuf, signatureBuf);
    } catch {
      return false;
    }
  }

  /**
   * Fetch payment details from Razorpay API
   */
  async fetchPayment(paymentId) {
    if (!this.isLive || !paymentId) return null;
    try {
      return await this.instance.payments.fetch(paymentId);
    } catch (err) {
      console.error('[Razorpay fetchPayment Error]', err.message);
      return null;
    }
  }
}

module.exports = new RazorpayService();
