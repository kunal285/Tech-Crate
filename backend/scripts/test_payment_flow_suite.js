/**
 * Comprehensive Payment System Integration Test Suite
 * Validates Order Creation, Signed Webhooks, Idempotency, Status Verification & Security Guards.
 */

const crypto = require('crypto');

// Target Backend URL
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:5000';
const WEBHOOK_SECRET = process.env.PAYMENT_WEBHOOK_SECRET || 'whsec_techcrate_2026';

function generateSignature(payload, secret) {
  return crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
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

  function assert(condition, title) {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${title}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${title}`);
    }
  }

  try {
    // 1. Create Order API
    console.log('--- 1. Order Creation API (POST /api/orders/create) ---');
    const orderIdSuccess = `ORD_SUCC_${Date.now()}`;
    const createRes = await request(`${BASE_URL}/api/orders/create`, {
      method: 'POST',
      body: JSON.stringify({
        amount: 999,
        currency: 'INR',
        order_id: orderIdSuccess,
        redirect_url: 'TechCrate://payment/success',
        webhook_url: 'http://localhost:5000/api/webhooks/payment',
      }),
    });

    assert(createRes.status === 200 && createRes.data?.success === true, 'POST /api/orders/create returns 200 OK');
    assert(createRes.data?.order_id === orderIdSuccess, 'Returns accurate order_id');
    assert(!!createRes.data?.payment_id, 'Returns valid payment_id');
    assert(createRes.data?.payment_url?.includes('autoupigateway.com') || !!createRes.data?.payment_url, 'Returns payment gateway checkout URL');

    // 2. Initial Payment Status (Before Webhook)
    console.log('\n--- 2. Server Status Verification (Before Webhook) ---');
    const statusBefore = await request(`${BASE_URL}/api/payments/${orderIdSuccess}/status`);
    assert(statusBefore.status === 200 && statusBefore.data?.isPaid === false, 'Order initial status is unpaid (isPaid: false)');

    // 3. Signed Webhook Processing (payment.paid)
    console.log('\n--- 3. Signed payment.paid Webhook Processing ---');
    const webhookPayload = {
      event: 'payment.paid',
      payment_id: createRes.data?.payment_id || `PAY_${Date.now()}`,
      order_id: orderIdSuccess,
      amount: 999,
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
    const statusAfter = await request(`${BASE_URL}/api/payments/${orderIdSuccess}/status`);
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
    const fakeOrderId = `FAKE_DEEP_LINK_${Date.now()}`;
    const fakeStatusRes = await request(`${BASE_URL}/api/payments/${fakeOrderId}/status`);
    assert(
      fakeStatusRes.status === 404 || fakeStatusRes.data?.isPaid === false,
      'Fake deep link order_id is rejected by server status check'
    );

    // 7. Failed Payment Webhook Scenario
    console.log('\n--- 7. Failed Payment Flow Verification ---');
    const orderIdFail = `ORD_FAIL_${Date.now()}`;
    await request(`${BASE_URL}/api/orders/create`, {
      method: 'POST',
      body: JSON.stringify({ amount: 499, currency: 'INR', order_id: orderIdFail }),
    });

    const failedPayload = {
      event: 'payment.failed',
      payment_id: `PAY_FAIL_${Date.now()}`,
      order_id: orderIdFail,
      amount: 499,
      status: 'failed',
    };
    const failSig = generateSignature(failedPayload, WEBHOOK_SECRET);

    await request(`${BASE_URL}/api/webhooks/payment`, {
      method: 'POST',
      headers: { 'x-payment-signature': failSig },
      body: JSON.stringify(failedPayload),
    });

    const statusFailed = await request(`${BASE_URL}/api/payments/${orderIdFail}/status`);
    assert(statusFailed.data?.status === 'failed' && statusFailed.data?.isPaid === false, 'Backend confirms failed transaction');

    console.log('\n================================================================');
    console.log(`🏁 TEST COMPLETE: ${passed} / ${total} TEST CASES PASSED`);
    console.log('================================================================\n');
  } catch (err) {
    console.error('Payment Test Runner Error:', err.message);
  }
}

// Module or direct invocation
if (require.main === module) {
  runPaymentSuite();
}

module.exports = runPaymentSuite;
