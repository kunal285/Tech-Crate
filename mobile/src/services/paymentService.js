import { Linking, Platform, Alert } from 'react-native';
import { apiGet, apiPost } from './api';
import { MERCHANT_CONFIG } from '../constants';
import RazorpayCheckout from 'react-native-razorpay';

export const UPI_APPS = [
  {
    id: 'all',
    name: 'Any UPI App (System Chooser)',
    description: 'Choose from all installed UPI apps on your device',
    schemePrefix: 'upi://pay',
    packageName: null,
    color: '#0284C7',
    popular: true,
  },
  {
    id: 'gpay',
    name: 'Google Pay',
    description: 'Pay via Google Pay / Tez',
    schemePrefix: 'gpay://upi/pay',
    fallbackScheme: 'upi://pay',
    packageName: 'com.google.android.apps.nbu.paisa.user',
    color: '#4285F4',
    popular: true,
  },
  {
    id: 'phonepe',
    name: 'PhonePe',
    description: 'Pay instantly with PhonePe UPI',
    schemePrefix: 'phonepe://pay',
    fallbackScheme: 'upi://pay',
    packageName: 'com.phonepe.app',
    color: '#5F259F',
    popular: true,
  },
  {
    id: 'paytm',
    name: 'Paytm UPI',
    description: 'Pay using Paytm Wallet & UPI',
    schemePrefix: 'paytmmp://pay',
    fallbackScheme: 'upi://pay',
    packageName: 'net.one97.paytm',
    color: '#00BAF2',
    popular: true,
  },
];

const paymentService = {
  // Create payment order alias (legacy — kept for backward compat)
  createPaymentOrder: async (orderData) => {
    return await apiPost('/payments/create-order', orderData);
  },

  // GET Server-Authoritative Payment Status
  getPaymentStatus: async (order_id) => {
    return await apiGet(`/payments/${order_id}/status`);
  },

  // Verify payment signature with backend
  verifyPayment: async (verificationData) => {
    return await apiPost('/payments/verify', verificationData);
  },

  /**
   * Open Razorpay in-app checkout modal.
   * @param {Object} sessionData - Response from POST /api/checkout/initiate
   * @param {Object} userInfo - { name, email, contact }
   * @returns {Promise<Object>} Razorpay payment response { razorpay_payment_id, razorpay_order_id, razorpay_signature }
   */
  openRazorpayCheckout: (sessionData, userInfo = {}) => {
    return new Promise((resolve, reject) => {
      const options = {
        description: 'Tech Crate Order Payment',
        image: 'https://tech-crate.onrender.com/logo.png',
        currency: sessionData.currency || 'INR',
        key: sessionData.razorpay_key_id || 'rzp_test_Tm3Zrmb9gAWjnG',
        amount: sessionData.razorpay_amount || Math.round(Number(sessionData.amount) * 100),
        order_id: sessionData.razorpay_order_id,
        name: 'Tech Crate',
        prefill: {
          name: sessionData.prefill?.name || userInfo.name || '',
          email: sessionData.prefill?.email || userInfo.email || '',
          contact: sessionData.prefill?.contact || userInfo.contact || '',
        },
        theme: { color: '#1E3A5F' },
        modal: {
          ondismiss: () => reject(new Error('Payment was cancelled.')),
        },
      };

      RazorpayCheckout.open(options)
        .then((data) => resolve(data))
        .catch((err) => reject(new Error(err?.description || err?.message || 'Payment failed or was cancelled.')));
    });
  },

  // Legacy: open a URL directly (kept for backward compat)
  openPaymentGateway: async (paymentUrl) => {
    if (!paymentUrl) throw new Error('Invalid payment gateway URL.');
    await Linking.openURL(paymentUrl);
  },




  /**
   * Constructs NPCI standard UPI Payment URI
   * Spec: upi://pay?pa=<vpa>&pn=<name>&am=<amount>&cu=INR&tn=<notes>&tr=<refId>
   */
  buildUpiUrl: ({
    vpa = MERCHANT_CONFIG.UPI_VPA,
    payeeName = MERCHANT_CONFIG.PAYEE_NAME,
    amount,
    transactionId,
    transactionNote = 'Tech Crate Order Payment',
    currency = 'INR',
    scheme = 'upi://pay',
  }) => {
    const formattedAmount = Number(amount).toFixed(2);
    const params = [
      `pa=${encodeURIComponent(vpa.trim())}`,
      `pn=${encodeURIComponent(payeeName.trim())}`,
      `am=${encodeURIComponent(formattedAmount)}`,
      `cu=${encodeURIComponent(currency)}`,
    ];

    if (transactionNote) {
      // Clean note without special characters that fail NPCI validation
      const cleanNote = String(transactionNote).replace(/[^a-zA-Z0-9 ]/g, '').trim();
      params.push(`tn=${encodeURIComponent(cleanNote || 'Order Payment')}`);
    }

    if (transactionId) {
      // Clean transaction ref ID
      const cleanRef = String(transactionId).replace(/[^a-zA-Z0-9]/g, '');
      params.push(`tr=${encodeURIComponent(cleanRef)}`);
    }

    const queryString = params.join('&');
    const baseScheme = scheme.includes('?') ? scheme : `${scheme}?`;
    return `${baseScheme}${queryString}`;
  },

  /**
   * Returns list of supported UPI apps with availability state
   */
  getAvailableUpiApps: async () => {
    const checkedApps = await Promise.all(
      UPI_APPS.map(async (app) => {
        if (app.id === 'all') {
          return { ...app, isAvailable: true };
        }
        try {
          const canOpen = await Linking.canOpenURL(`${app.schemePrefix}?pa=test@upi`);
          return { ...app, isAvailable: Boolean(canOpen) };
        } catch {
          return { ...app, isAvailable: true }; // Default to true so user can tap
        }
      })
    );
    return checkedApps;
  },

  /**
   * Launch selected UPI App or Universal Android Intent Chooser
   */
  launchUpiPayment: async ({
    appId = 'all',
    amount,
    orderId,
    vpa = MERCHANT_CONFIG.UPI_VPA,
    payeeName = MERCHANT_CONFIG.PAYEE_NAME,
    transactionNote,
  }) => {
    const selectedApp = UPI_APPS.find((a) => a.id === appId) || UPI_APPS[0];
    const targetScheme = selectedApp.schemePrefix || 'upi://pay';

    const upiUrl = paymentService.buildUpiUrl({
      vpa,
      payeeName,
      amount,
      transactionId: orderId,
      transactionNote: transactionNote || `TechCrate Order #${orderId}`,
      scheme: targetScheme,
    });

    const fallbackUpiUrl = paymentService.buildUpiUrl({
      vpa,
      payeeName,
      amount,
      transactionId: orderId,
      transactionNote: transactionNote || `TechCrate Order #${orderId}`,
      scheme: 'upi://pay',
    });

    try {
      const canOpen = await Linking.canOpenURL(upiUrl).catch(() => true);
      if (canOpen) {
        await Linking.openURL(upiUrl);
        return { success: true, upiUrl };
      } else {
        // Try fallback universal upi://pay scheme
        await Linking.openURL(fallbackUpiUrl);
        return { success: true, upiUrl: fallbackUpiUrl };
      }
    } catch (err) {
      console.warn('[UPI Launch Attempt Failed, trying universal chooser]', err.message);
      try {
        await Linking.openURL(fallbackUpiUrl);
        return { success: true, upiUrl: fallbackUpiUrl };
      } catch (fallbackErr) {
        throw new Error(
          `Unable to open ${selectedApp.name}. Please ensure a UPI application (Google Pay, PhonePe, Paytm, etc.) is installed.`
        );
      }
    }
  },

  // Backward compatibility alias for Google Pay
  launchGooglePayUPI: async (params) => {
    return await paymentService.launchUpiPayment({ ...params, appId: 'gpay' });
  },

  // Get payment history
  getPaymentHistory: async (params = {}) => {
    return await apiGet('/payments/history', params);
  },
};

export { paymentService };
export default paymentService;
