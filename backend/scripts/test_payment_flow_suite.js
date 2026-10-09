require('dotenv').config();
const crypto = require('crypto');

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:5000';
const WEBHOOK_SECRET = process.env.PAYMENT_WEBHOOK_SECRET || process.env.AUTO_UPI_WEBHOOK_SECRET || 'whsec_techcrate_2026';

function generateSignature(payload, secret) {
  const str = typeof payload === 'string' ? payload : JSON.stringify(payload);
  return crypto.createHmac('sha256', secret).update(str).digest('hex');
}

async function request(url, options = {}) {
  const { headers: customHeaders, ...restOptions } = options;
  const res = await fetch(url, {
    ...restOptions,
    headers: {
      'Content-Type': 'application/json',
      ...(customHeaders || {}),
    },
  });
  let data = null;
  try {
    data = await res.json();
  } catch (err) {}
  return { status: res.status, ok: res.ok, data };
}

async function runPaymentSuite() {
  console.log('\n================================================================');
  console.log('💳 STARTING TECHCRATE PAYMENT & DEEP LINK SYSTEM TEST SUITE');
  console.log('================================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition, title, details = '') {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${title}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${title} -> ${details}`);
    }
  }

  try {
    // 0. Setup: Register Test User
    const ts = Date.now();
    const userEmail = `payuser_${ts}@techcrate.com`;
    const regRes = await request(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      body: JSON.stringify({
        name: 'Payment Suite User',
        email: userEmail,
        password: 'Password123!',
        phone: `91${Math.floor(10000000 + Math.random() * 90000000)}`,
      }),
    });
    const userToken = regRes.data?.token;

    // Fetch product
    const productsRes = await request(`${BASE_URL}/api/products`);
    const allProds = productsRes.data?.products || (Array.isArray(productsRes.data) ? productsRes.data : []);
    const testProductId = allProds[0]?._id || '65f123456789012345678901';

    // 1. Create Base Order
    console.log('--- 1. Order Creation & Payment Intent Initiation ---');
    const orderRes = await request(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: JSON.stringify({
        orderItems: [{ product: String(testProductId), quantity: 1 }],
        shippingAddress: {
          fullName: 'Test User',
          phone: '9876543210',
          street: '123 Test St',
          city: 'City',
          state: 'State',
          pincode: '560001',
          country: 'India',
        },
        paymentMethod: 'UPI',
      }),
    });

    const order = orderRes.data?.order;
    const orderIdSuccess = String(order?._id);

    const createRes = await request(`${BASE_URL}/api/payments/create-order`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: JSON.stringify({
        order_id: orderIdSuccess,
        redirect_url: 'techcrate://payment/success',
        webhook_url: 'http://localhost:5000/api/webhooks/payment',
      }),
    });

    assert(createRes.status === 200 && createRes.data?.success === true, 'POST /api/payments/create-order returns 200 OK', `Status: ${createRes.status}, data: ${JSON.stringify(createRes.data)}`);
    assert(createRes.data?.order_id === orderIdSuccess, 'Returns accurate order_id', JSON.stringify(createRes.data));
    assert(!!createRes.data?.payment_url || !!createRes.data?.upi_intent_url, 'Returns payment gateway checkout URL or direct UPI intent', JSON.stringify(createRes.data));

    // 2. Initial Payment Status (Before Webhook)
    console.log('\n--- 2. Server Status Verification (Before Webhook) ---');
    const statusBefore = await request(`${BASE_URL}/api/payments/${orderIdSuccess}/status`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert(statusBefore.status === 200 && statusBefore.data?.isPaid === false, 'Order initial status is unpaid (isPaid: false)');

    // 3. Signed Webhook Processing (payment.paid)
    console.log('\n--- 3. Signed payment.paid Webhook Processing ---');
    const webhookPayload = {
      event: 'payment.paid',
      payment_id: createRes.data?.payment_reference || `PAY_${Date.now()}`,
      order_id: orderIdSuccess,
      amount: order.totalPrice,
      currency: 'INR',
      status: 'paid',
    };
    const signature = generateSignature(webhookPayload, WEBHOOK_SECRET);

    const webhookRes = await request(`${BASE_URL}/api/webhooks/payment`, {
      method: 'POST',
      headers: {
        'x-payment-signature': signature,
      },
      body: JSON.stringify(webhookPayload),
    });

    assert(webhookRes.status === 200 && webhookRes.data?.success === true, 'Signed webhook returns 200 OK');

    // 4. Server Status Verification (After Webhook)
    console.log('\n--- 4. Server Status Verification (After Webhook) ---');
    const statusAfter = await request(`${BASE_URL}/api/payments/${orderIdSuccess}/status`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert(statusAfter.status === 200 && statusAfter.data?.isPaid === true && statusAfter.data?.status === 'paid', 'Backend authoritatively confirms PAID');

    // 5. Webhook Idempotency Check (Duplicate Webhook)
    console.log('\n--- 5. Webhook Idempotency Verification ---');
    const duplicateWebhookRes = await request(`${BASE_URL}/api/webhooks/payment`, {
      method: 'POST',
      headers: {
        'x-payment-signature': signature,
      },
      body: JSON.stringify(webhookPayload),
    });

    assert(
      duplicateWebhookRes.status === 200 && duplicateWebhookRes.data?.processed === true,
      'Duplicate webhook detected and processed idempotently without side-effects'
    );

    // 6. Fake Deep Link Guard Check
    console.log('\n--- 6. Fake Deep Link Prevention Guard ---');
    const fakeOrderId = `65f123456789012345678999`;
    const fakeStatusRes = await request(`${BASE_URL}/api/payments/${fakeOrderId}/status`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert(
      fakeStatusRes.status === 404 || fakeStatusRes.data?.isPaid === false,
      'Fake deep link order_id is rejected by server status check'
    );

    // 7. Failed Payment Flow Verification
    console.log('\n--- 7. Failed Payment Flow Verification ---');
    const failOrderRes = await request(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: JSON.stringify({
        orderItems: [{ product: String(testProductId), quantity: 1 }],
        shippingAddress: {
          fullName: 'Fail Test User',
          phone: '9876543210',
          street: '123 Test St',
          city: 'City',
          state: 'State',
          pincode: '560001',
          country: 'India',
        },
        paymentMethod: 'UPI',
      }),
    });
    const orderFail = failOrderRes.data?.order;
    const orderIdFail = String(orderFail?._id);

    const failedPayload = {
      event: 'payment.failed',
      payment_id: `PAY_FAIL_${Date.now()}`,
      order_id: orderIdFail,
      amount: orderFail?.totalPrice || 499,
      status: 'failed',
    };
    const failSig = generateSignature(failedPayload, WEBHOOK_SECRET);

    await request(`${BASE_URL}/api/webhooks/payment`, {
      method: 'POST',
      headers: { 'x-payment-signature': failSig },
      body: JSON.stringify(failedPayload),
    });

    const statusFailed = await request(`${BASE_URL}/api/payments/${orderIdFail}/status`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert(statusFailed.data?.status === 'failed' && statusFailed.data?.isPaid === false, 'Backend confirms failed transaction');

    console.log('\n================================================================');
    console.log(`🏁 TEST COMPLETE: ${passed} / ${total} TEST CASES PASSED`);
    console.log('================================================================\n');
  } catch (err) {
    console.error('Payment Test Runner Error:', err.message);
  }
}

if (require.main === module) {
  runPaymentSuite();
}

module.exports = runPaymentSuite;
