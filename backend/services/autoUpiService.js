/**
 * Auto UPI Gateway Service (https://autoupigateway.com)
 * Handles order creation, status verification, and webhook handling for Auto UPI Gateway integration.
 */
class AutoUpiService {
  constructor() {
    this.baseUrl = process.env.AUTO_UPI_GATEWAY_URL || 'https://autoupigateway.com';
    this.userToken = process.env.AUTO_UPI_USER_TOKEN || process.env.AUTO_UPI_KEY || '';
    this.secretKey = process.env.AUTO_UPI_WEBHOOK_SECRET || process.env.AUTO_UPI_SECRET || '';
  }

  /**
   * Create an Auto UPI Gateway Order Intent
   * @param {Object} params - Order creation parameters
   * @returns {Promise<Object>}
   */
  async createOrder({ orderId, amount, customerName, customerEmail, customerMobile, redirectUrl }) {
    const isProdKeyAvailable = !!this.userToken && this.userToken !== 'your_auto_upi_user_token_here';

    if (!isProdKeyAvailable) {
      console.log('[Auto UPI Gateway] Sandbox mode active: generating mock payment gateway response.');
      const mockTxnId = `UPI_${orderId || Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
      const mockPaymentUrl = `${this.baseUrl}/pay?token=mock_sandbox_token_${mockTxnId}&amount=${amount}`;
      const mockUpiIntent = `upi://pay?pa=techcrate@upi&pn=TechCrate&tr=${mockTxnId}&tn=Order_${orderId}&am=${amount}&cu=INR`;

      return {
        success: true,
        gateway: 'AutoUPI',
        gatewayUrl: this.baseUrl,
        orderId: orderId || null,
        txnId: mockTxnId,
        amount: Number(amount),
        currency: 'INR',
        paymentUrl: mockPaymentUrl,
        upiIntentUrl: mockUpiIntent,
        qrData: mockUpiIntent,
        status: 'PENDING',
        isSandbox: true,
        createdAt: new Date().toISOString(),
      };
    }

    try {
      const payload = {
        user_token: this.userToken,
        amount: String(amount),
        order_id: String(orderId),
        customer_name: customerName || 'TechCrate Customer',
        customer_email: customerEmail || 'customer@techcrate.com',
        customer_mobile: customerMobile || '9876543210',
        redirect_url: redirectUrl || 'https://techcrate.com/payment/callback',
        remark: `TechCrate Order #${orderId}`,
      };

      const response = await fetch(`${this.baseUrl}/api/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const resData = await response.json();
      if (resData && (resData.status === true || resData.status === 'COMPLETED' || resData.status === 200 || resData.success === true)) {
        return {
          success: true,
          gateway: 'AutoUPI',
          gatewayUrl: this.baseUrl,
          orderId: orderId,
          txnId: resData.result?.order_id || resData.txnid || resData.order_id || orderId,
          amount: Number(amount),
          currency: 'INR',
          paymentUrl: resData.result?.payment_url || resData.payment_url || resData.url,
          upiIntentUrl: resData.result?.upi_intent_url || resData.upi_intent_url || resData.payment_url,
          qrData: resData.result?.qr_code || resData.qr_data || resData.result?.payment_url,
          status: 'PENDING',
          isSandbox: false,
          createdAt: new Date().toISOString(),
        };
      } else {
        throw new Error(resData?.message || resData?.error || 'Failed to initialize Auto UPI Gateway session.');
      }
    } catch (error) {
      console.error('[Auto UPI Gateway Create Error]', error.message);
      // Fallback to sandbox response in non-production if API call fails
      if (process.env.NODE_ENV !== 'production') {
        const mockTxnId = `UPI_FB_${orderId || Date.now()}`;
        return {
          success: true,
          gateway: 'AutoUPI',
          gatewayUrl: this.baseUrl,
          orderId: orderId || null,
          txnId: mockTxnId,
          amount: Number(amount),
          currency: 'INR',
          paymentUrl: `${this.baseUrl}/pay?token=sandbox_${mockTxnId}`,
          upiIntentUrl: `upi://pay?pa=techcrate@upi&tr=${mockTxnId}&am=${amount}`,
          qrData: `upi://pay?pa=techcrate@upi&tr=${mockTxnId}&am=${amount}`,
          status: 'PENDING',
          isSandbox: true,
          createdAt: new Date().toISOString(),
        };
      }
      throw error;
    }
  }

  /**
   * Verify/Check Auto UPI Gateway transaction status
   * @param {string} orderId - Order ID or Transaction ID
   * @returns {Promise<Object>}
   */
  async checkOrderStatus(orderId) {
    const isProdKeyAvailable = !!this.userToken && this.userToken !== 'your_auto_upi_user_token_here';

    if (!isProdKeyAvailable) {
      return {
        success: true,
        orderId,
        status: 'COMPLETED',
        isPaid: true,
        gateway: 'AutoUPI',
        isSandbox: true,
        verifiedAt: new Date().toISOString(),
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/check-order-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_token: this.userToken,
          order_id: String(orderId),
        }),
      });

      const resData = await response.json();
      const rawStatus = (resData.result?.status || resData.status || '').toString().toUpperCase();
      const isPaid = rawStatus === 'COMPLETED' || rawStatus === 'SUCCESS' || rawStatus === 'PAID';

      return {
        success: true,
        orderId,
        status: rawStatus || 'COMPLETED',
        isPaid,
        gateway: 'AutoUPI',
        rawResponse: resData,
        verifiedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('[Auto UPI Check Status Error]', error.message);
      if (process.env.NODE_ENV !== 'production') {
        return {
          success: true,
          orderId,
          status: 'COMPLETED',
          isPaid: true,
          gateway: 'AutoUPI',
          isSandbox: true,
          verifiedAt: new Date().toISOString(),
        };
      }
      throw error;
    }
  }

  /**
   * Verify Webhook payload from Auto UPI Gateway
   * @param {Object} body - Request body
   * @param {Object} headers - Request headers
   * @returns {boolean}
   */
  verifyWebhook(body, headers = {}) {
    if (!this.secretKey || process.env.NODE_ENV !== 'production') {
      return true;
    }
    const token = headers['x-autoupi-token'] || body?.user_token || body?.secret;
    return token === this.secretKey || token === this.userToken;
  }
}

module.exports = new AutoUpiService();
