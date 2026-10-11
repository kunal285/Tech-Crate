const crypto = require('crypto');

/**
 * Auto UPI Gateway Service (https://autoupigateway.com)
 * Official Public v1 API Client:
 * - Create Order: POST /api/public/v1/create-order
 * - Order Status: GET /api/public/v1/order-status?order_id=ORD...
 * - Webhook Signature Verification: HMAC-SHA256 (t=...,v1=...)
 */
class AutoUpiService {
  constructor() {
    this.baseUrl =
      process.env.AUTO_UPI_GATEWAY_URL?.replace(/\/$/, '') || 'https://autoupigateway.com';
    this.apiBase = `${this.baseUrl}/api/public/v1`;
    this.apiKey =
      process.env.AUTO_UPI_USER_TOKEN ||
      process.env.AUTO_UPI_KEY ||
      process.env.AUTO_UPI_API_KEY ||
      '';
    this.webhookSecret =
      process.env.AUTO_UPI_WEBHOOK_SECRET || process.env.AUTO_UPI_SECRET || '';
  }

  /**
   * Create an Auto UPI Gateway Order
   * @param {Object} params - Order creation parameters
   * @returns {Promise<Object>}
   */
  async createOrder({
    orderId,
    amount,
    customerName,
    customerEmail,
    customerMobile,
    redirectUrl,
    failureUrl,
    webhookUrl,
  }) {
    const isLiveKeyAvailable =
      Boolean(this.apiKey) &&
      this.apiKey.startsWith('augw_live_') &&
      this.apiKey !== 'your_auto_upi_user_token_here';

    const successRedirectUrl =
      redirectUrl ||
      process.env.PAYMENT_SUCCESS_REDIRECT_URL ||
      'https://tech-crate.onrender.com/payment-success';
    const failedRedirectUrl =
      failureUrl ||
      process.env.PAYMENT_FAILED_REDIRECT_URL ||
      'https://tech-crate.onrender.com/payment-failed';
    const finalWebhookUrl =
      webhookUrl ||
      process.env.PAYMENT_GLOBAL_WEBHOOK_URL ||
      'https://tech-crate.onrender.com/autoupi-webhook';

    if (!isLiveKeyAvailable) {
      console.log(
        '[Auto UPI Gateway] Sandbox mode active: generating mock payment gateway response.'
      );
      const mockTxnId = `UPI_${orderId || Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
      const mockPaymentUrl = successRedirectUrl.includes('?')
        ? `${successRedirectUrl}&session_id=${orderId}&mock_txn=${mockTxnId}&status=paid`
        : `${successRedirectUrl}?session_id=${orderId}&mock_txn=${mockTxnId}&status=paid`;
      const mockUpiIntent = `upi://pay?pa=techcrate@upi&pn=TechCrate&tr=${mockTxnId}&tn=Order_${orderId}&am=${amount}&cu=INR`;

      return {
        success: true,
        gateway: 'AutoUPI',
        gatewayUrl: this.baseUrl,
        orderId: orderId || null,
        gatewayOrderId: mockTxnId,
        slug: 'mock_slug',
        amount: Number(amount),
        payableAmount: Number(amount),
        currency: 'INR',
        paymentUrl: mockPaymentUrl,
        upiIntentUrl: mockUpiIntent,
        qrData: mockUpiIntent,
        status: 'active',
        isSandbox: true,
        createdAt: new Date().toISOString(),
      };
    }

    try {
      const payload = {
        amount: Number(amount),
        customer_name: customerName || 'TechCrate Customer',
        webhook_url: finalWebhookUrl,
        success_redirect_url: successRedirectUrl,
        failure_redirect_url: failedRedirectUrl,
      };

      const response = await fetch(`${this.apiBase}/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey,
        },
        body: JSON.stringify(payload),
      });

      let resData = null;
      try {
        const text = await response.text();
        resData = JSON.parse(text);
      } catch {
        resData = { ok: false, error: 'Invalid response from upstream payment provider.' };
      }

      if (resData && (resData.ok === true || resData.status === 'active')) {
        const paymentUrl =
          resData.payment_url || `${this.baseUrl}/pay/${resData.slug || resData.order_id}`;
        const upiIntent =
          resData.upi_intent ||
          `upi://pay?pa=techcrate@upi&pn=TechCrate&tr=${resData.order_id}&am=${resData.payable_amount || amount}&cu=INR`;

        return {
          success: true,
          gateway: 'AutoUPI',
          gatewayUrl: this.baseUrl,
          orderId: orderId,
          gatewayOrderId: resData.order_id,
          slug: resData.slug,
          amount: Number(resData.amount || amount),
          payableAmount: Number(resData.payable_amount || amount),
          currency: 'INR',
          paymentUrl,
          upiIntentUrl: upiIntent,
          qrData: resData.qr_data || paymentUrl,
          expiresAt: resData.expires_at,
          status: resData.status || 'active',
          isSandbox: false,
          createdAt: new Date().toISOString(),
        };
      }

      console.warn('[Auto UPI Gateway Error Response]', resData);
      throw new Error(resData?.error || resData?.message || 'Failed to initialize payment gateway.');
    } catch (error) {
      console.warn('[Auto UPI Gateway Exception]', error.message);
      const isQuotaExceeded = error.message === 'QUOTA_EXCEEDED';
      // Fallback response for offline resilience and upstream quota exhaustion:
      // We do NOT return a fake URL on autoupigateway.com because that URL will 404 with "This page didn't load".
      // Instead, we return valid UPI intent & QR data for seamless local payment.
      const mockTxnId = `UPI_DIR_${orderId || Date.now()}`;
      return {
        success: true,
        gateway: 'AutoUPI',
        gatewayUrl: this.baseUrl,
        orderId: orderId || null,
        gatewayOrderId: mockTxnId,
        slug: 'direct_upi',
        amount: Number(amount),
        payableAmount: Number(amount),
        currency: 'INR',
        paymentUrl: null,
        upiIntentUrl: `upi://pay?pa=8329276568@ptyes&pn=TechCrate&tr=${orderId}&tn=Order_${orderId}&am=${amount}&cu=INR`,
        qrData: `upi://pay?pa=8329276568@ptyes&pn=TechCrate&tr=${orderId}&tn=Order_${orderId}&am=${amount}&cu=INR`,
        status: 'active',
        isSandbox: false,
        isFallback: true,
        quotaExceeded: isQuotaExceeded,
        createdAt: new Date().toISOString(),
      };
    }
  }

  /**
   * Verify/Check Auto UPI Gateway transaction status
   * Official GET /api/public/v1/order-status?order_id=...
   * @param {string} orderId - Auto UPI Gateway Order ID (e.g. ORD...)
   * @returns {Promise<Object>}
   */
  async checkOrderStatus(orderId) {
    if (!orderId) {
      return { success: false, message: 'Order ID is required' };
    }

    const isLiveKeyAvailable =
      Boolean(this.apiKey) &&
      this.apiKey.startsWith('augw_live_') &&
      this.apiKey !== 'your_auto_upi_user_token_here';

    if (!isLiveKeyAvailable) {
      return {
        success: true,
        orderId,
        status: 'PENDING',
        isPaid: false,
        gateway: 'AutoUPI',
        isSandbox: true,
        message: 'Sandbox mode: awaiting verified webhook or admin confirmation.',
        verifiedAt: null,
      };
    }

    try {
      const response = await fetch(
        `${this.apiBase}/order-status?order_id=${encodeURIComponent(orderId)}`,
        {
          method: 'GET',
          headers: {
            'X-API-Key': this.apiKey,
          },
        }
      );

      const resData = await response.json();
      if (resData && resData.ok === true && resData.order) {
        const orderInfo = resData.order;
        const isPaid = String(orderInfo.status).toLowerCase() === 'paid';

        return {
          success: true,
          orderId,
          gatewayOrderId: orderInfo.order_id,
          status: orderInfo.status,
          isPaid,
          amount: orderInfo.amount,
          payableAmount: orderInfo.payable_amount,
          payerName: orderInfo.payer_name,
          paidAt: orderInfo.paid_at,
          detectedAt: orderInfo.detected_at,
          gateway: 'AutoUPI',
          rawResponse: resData,
          verifiedAt: isPaid ? orderInfo.paid_at || new Date().toISOString() : null,
        };
      }

      return {
        success: false,
        orderId,
        status: 'PENDING',
        isPaid: false,
        gateway: 'AutoUPI',
        message: resData?.error || 'Unable to retrieve order status from Auto UPI Gateway',
        rawResponse: resData,
      };
    } catch (error) {
      console.error('[Auto UPI Check Status Error]', error.message);
      return {
        success: false,
        orderId,
        status: 'PENDING',
        isPaid: false,
        gateway: 'AutoUPI',
        error: error.message,
        verifiedAt: null,
      };
    }
  }

  /**
   * Verify HMAC-SHA256 Webhook signature from Auto UPI Gateway
   * Header format: X-AutoUPIGateway-Signature: t=<timestamp>,v1=<signature>
   * Expected: HMAC-SHA256(secret, `${t}.${rawBody}`) === v1
   * @param {string|Buffer} rawBody - Raw request body
   * @param {Object} headers - Request headers
   * @returns {boolean}
   */
  verifyWebhookSignature(rawBody, headers = {}) {
    const sigHeader =
      headers['x-autoupigateway-signature'] ||
      headers['X-AutoUPIGateway-Signature'] ||
      headers['x-autoupi-signature'];

    if (!sigHeader) {
      // Allow in non-production environments if secret is not enforced
      return process.env.NODE_ENV !== 'production';
    }

    const secret = this.webhookSecret;
    if (!secret) {
      console.warn('[Auto UPI Webhook] Warning: AUTO_UPI_WEBHOOK_SECRET is not configured.');
      return false;
    }

    try {
      const parts = Object.fromEntries(
        sigHeader.split(',').map((kv) => kv.trim().split('='))
      );
      const { t, v1 } = parts;

      if (!t || !v1) {
        return false;
      }

      const bodyStr = Buffer.isBuffer(rawBody) ? rawBody.toString('utf8') : String(rawBody);
      const expected = crypto
        .createHmac('sha256', secret)
        .update(`${t}.${bodyStr}`)
        .digest('hex');

      const v1Buf = Buffer.from(v1, 'hex');
      const expBuf = Buffer.from(expected, 'hex');

      if (v1Buf.length === expBuf.length && crypto.timingSafeEqual(v1Buf, expBuf)) {
        return true;
      }
      return false;
    } catch (err) {
      console.error('[Auto UPI Webhook Verification Error]', err);
      return false;
    }
  }
}

module.exports = new AutoUpiService();
