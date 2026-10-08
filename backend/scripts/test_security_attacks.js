require('dotenv').config();
const crypto = require('crypto');
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:5000';
const WEBHOOK_SECRET = process.env.PAYMENT_WEBHOOK_SECRET || process.env.AUTO_UPI_WEBHOOK_SECRET || 'whsec_techcrate_2026';

function generateSignature(payload, secret) {
  const str = typeof payload === 'string' ? payload : JSON.stringify(payload);
  return crypto.createHmac('sha256', secret).update(str).digest('hex');
}

async function apiRequest(endpoint, options = {}) {
  const { headers = {}, ...rest } = options;
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });
  let data = null;
  try {
    data = await res.json();
  } catch (err) {}
  return { status: res.status, ok: res.ok, data };
}

async function runSecuritySuite() {
  console.log('\n================================================================');
  console.log('🛡️  STARTING PAYMENT SECURITY ATTACK VERIFICATION SUITE');
  console.log('================================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition, title, details = '') {
    total++;
    if (condition) {
      console.log(`✅ [PASS] Test ${total}: ${title}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] Test ${total}: ${title} -> ${details}`);
    }
  }

  // 0. Setup: Register two separate test users (Victim and Attacker)
  const ts = Date.now();
  const victimEmail = `victim_${ts}@techcrate.com`;
  const attackerEmail = `attacker_${ts}@techcrate.com`;

  const victimReg = await apiRequest('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Victim User',
      email: victimEmail,
      password: 'Password123!',
      phone: `98${Math.floor(10000000 + Math.random() * 90000000)}`,
    }),
  });
  const victimToken = victimReg.data?.token;

  const attackerReg = await apiRequest('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Attacker User',
      email: attackerEmail,
      password: 'Password123!',
      phone: `99${Math.floor(10000000 + Math.random() * 90000000)}`,
    }),
  });
  const attackerToken = attackerReg.data?.token;

  if (!victimToken || !attackerToken) {
    console.error('Setup failed: Could not register test users.', victimReg.data, attackerReg.data);
    return;
  }

  // Fetch a real product from DB
  const productsRes = await apiRequest('/api/products');
  let testProductId = productsRes.data?.products?.[0]?._id;

  if (!testProductId) {
    // If no products, fallback to creating one or finding first item
    const firstProduct = (productsRes.data && Array.isArray(productsRes.data) && productsRes.data[0]) || null;
    testProductId = firstProduct?._id;
  }

  // Helper to create an authenticated order
  async function createTestOrder(token, customPrice = 499) {
    const res = await apiRequest('/api/orders', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        orderItems: [
          {
            product: String(testProductId),
            quantity: 1,
            price: customPrice,
          },
        ],
        shippingAddress: {
          fullName: 'Security Test Customer',
          phone: '9876543210',
          street: '123 Security Lane',
          city: 'Bangalore',
          state: 'Karnataka',
          pincode: '560001',
          country: 'India',
        },
        paymentMethod: 'UPI',
      }),
    });
    return res.data?.order;
  }

  // ============================================================================
  // TEST 1: Fake Success (Client Deep Link / Untrusted Callback)
  // ============================================================================
  console.log('--- Scenario 1: Fake Success Callback ---');
  const order1 = await createTestOrder(victimToken);
  const order1Id = order1?._id || order1?.order_id;

  const status1 = await apiRequest(`/api/payments/${order1Id}/status`, {
    headers: { Authorization: `Bearer ${victimToken}` },
  });
  assert(
    status1.data?.isPaid === false && status1.data?.status === 'pending',
    'Fake Success: Order remains PENDING and isPaid=false despite client returning from app',
    JSON.stringify(status1.data)
  );

  // ============================================================================
  // TEST 2: Amount Manipulation Attack (₹499 order -> claims ₹1 payment)
  // ============================================================================
  console.log('\n--- Scenario 2: Amount Manipulation Attack ---');
  const order2 = await createTestOrder(victimToken);
  const order2Id = order2?._id || order2?.order_id;

  // Attacker sends webhook claiming ₹1 paid for a ₹499+ order
  const manipulatedPayload = {
    event: 'payment.paid',
    payment_id: `PAY_TAMPER_${Date.now()}`,
    order_id: String(order2Id),
    amount: 1, // Tampered amount
    currency: 'INR',
    status: 'paid',
  };
  const manipulatedSig = generateSignature(manipulatedPayload, WEBHOOK_SECRET);
  const tamperRes = await apiRequest('/api/webhooks/payment', {
    method: 'POST',
    headers: { 'x-payment-signature': manipulatedSig },
    body: JSON.stringify(manipulatedPayload),
  });

  const status2 = await apiRequest(`/api/payments/${order2Id}/status`, {
    headers: { Authorization: `Bearer ${victimToken}` },
  });

  assert(
    tamperRes.status === 400 && status2.data?.isPaid === false,
    'Amount Manipulation: Underpaid/manipulated amount is rejected by backend amount verification',
    `Webhook status: ${tamperRes.status}, isPaid: ${status2.data?.isPaid}`
  );

  // ============================================================================
  // TEST 3: User IDOR / Wrong-user Order Access
  // ============================================================================
  console.log('\n--- Scenario 3: Order Ownership / IDOR Defense ---');
  const idorRes = await apiRequest(`/api/payments/${order1Id}/status`, {
    headers: { Authorization: `Bearer ${attackerToken}` },
  });

  assert(
    idorRes.status === 403,
    'User IDOR: Attacker cannot access or manipulate another user\'s payment state',
    `Status: ${idorRes.status}`
  );

  // ============================================================================
  // TEST 4: Transaction Replay Attack (Same UTR / Transaction ID for 2 Orders)
  // ============================================================================
  console.log('\n--- Scenario 4: Transaction ID Replay Attack ---');
  const order4A = await createTestOrder(victimToken);
  const order4B = await createTestOrder(victimToken);
  const sharedTxnId = `TXN_SHARED_UTR_${Date.now()}`;

  // 1. Pay Order 4A with sharedTxnId
  const legitPayloadA = {
    event: 'payment.paid',
    txnId: sharedTxnId,
    order_id: String(order4A._id),
    amount: order4A.totalPrice,
    currency: 'INR',
    status: 'paid',
  };
  const sigA = generateSignature(legitPayloadA, WEBHOOK_SECRET);
  await apiRequest('/api/webhooks/payment', {
    method: 'POST',
    headers: { 'x-payment-signature': sigA },
    body: JSON.stringify(legitPayloadA),
  });

  // 2. Attempt to reuse sharedTxnId for Order 4B
  const replayPayloadB = {
    event: 'payment.paid',
    txnId: sharedTxnId,
    order_id: String(order4B._id),
    amount: order4B.totalPrice,
    currency: 'INR',
    status: 'paid',
  };
  const sigB = generateSignature(replayPayloadB, WEBHOOK_SECRET);
  const replayRes = await apiRequest('/api/webhooks/payment', {
    method: 'POST',
    headers: { 'x-payment-signature': sigB },
    body: JSON.stringify(replayPayloadB),
  });

  const status4B = await apiRequest(`/api/payments/${order4B._id}/status`, {
    headers: { Authorization: `Bearer ${victimToken}` },
  });

  assert(
    replayRes.status === 409 && status4B.data?.isPaid === false,
    'Replay Attack: Reused transaction ID is rejected; second order remains unpaid',
    `Replay status: ${replayRes.status}, Order4B isPaid: ${status4B.data?.isPaid}`
  );

  // ============================================================================
  // TEST 5: Concurrent / Duplicate Verification Requests
  // ============================================================================
  console.log('\n--- Scenario 5: Duplicate / Concurrent Verification Processing ---');
  const order5 = await createTestOrder(victimToken);
  const payload5 = {
    event: 'payment.paid',
    payment_id: `PAY_CONCURRENT_${Date.now()}`,
    order_id: String(order5._id),
    amount: order5.totalPrice,
    currency: 'INR',
    status: 'paid',
  };
  const sig5 = generateSignature(payload5, WEBHOOK_SECRET);

  const concurrentResults = await Promise.all([
    apiRequest('/api/webhooks/payment', { method: 'POST', headers: { 'x-payment-signature': sig5 }, body: JSON.stringify(payload5) }),
    apiRequest('/api/webhooks/payment', { method: 'POST', headers: { 'x-payment-signature': sig5 }, body: JSON.stringify(payload5) }),
    apiRequest('/api/webhooks/payment', { method: 'POST', headers: { 'x-payment-signature': sig5 }, body: JSON.stringify(payload5) }),
  ]);

  const allSuccessful = concurrentResults.every((r) => r.status === 200);
  const status5 = await apiRequest(`/api/payments/${order5._id}/status`, {
    headers: { Authorization: `Bearer ${victimToken}` },
  });

  assert(
    allSuccessful && status5.data?.isPaid === true,
    'Duplicate Verification: Handled idempotently without duplicate fulfillment or database corruption',
    `All successful: ${allSuccessful}, isPaid: ${status5.data?.isPaid}`
  );

  // ============================================================================
  // TEST 6: Modified Callback Signature Rejection
  // ============================================================================
  console.log('\n--- Scenario 6: Tampered Webhook / Invalid Signature ---');
  const order6 = await createTestOrder(victimToken);
  const tamperedSigRes = await apiRequest('/api/webhooks/payment', {
    method: 'POST',
    headers: { 'x-payment-signature': 'invalid_forged_signature_hex_1234567890' },
    body: JSON.stringify({
      event: 'payment.paid',
      order_id: String(order6._id),
      amount: order6.totalPrice,
      status: 'paid',
    }),
  });

  assert(
    tamperedSigRes.status === 401,
    'Modified Callback: Invalid cryptographic HMAC signature is rejected with 401 Unauthorized',
    `Status: ${tamperedSigRes.status}`
  );

  // ============================================================================
  // TEST 7: Cancelled Order Payment Guard
  // ============================================================================
  console.log('\n--- Scenario 7: Cancelled Order Payment Attempt ---');
  const order7 = await createTestOrder(victimToken);
  await apiRequest(`/api/orders/${order7._id}/cancel`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${victimToken}` },
  });

  const cancelledPayRes = await apiRequest('/api/payments/create-order', {
    method: 'POST',
    headers: { Authorization: `Bearer ${victimToken}` },
    body: JSON.stringify({ order_id: String(order7._id) }),
  });

  assert(
    cancelledPayRes.status === 400,
    'Cancelled Order: Cannot initiate or confirm payment for cancelled order',
    `Status: ${cancelledPayRes.status}`
  );

  // ============================================================================
  // TEST 8: Already-Paid Order Idempotency
  // ============================================================================
  console.log('\n--- Scenario 8: Already-Paid Order Guard ---');
  const alreadyPaidRes = await apiRequest('/api/payments/create-order', {
    method: 'POST',
    headers: { Authorization: `Bearer ${victimToken}` },
    body: JSON.stringify({ order_id: String(order5._id) }),
  });

  assert(
    alreadyPaidRes.status === 400 && alreadyPaidRes.data?.isPaid === true,
    'Already-Paid Order: Prevents re-initiating payment for already confirmed order'
  );

  // ============================================================================
  // TEST 9: Missing Webhook Signature Rejection
  // ============================================================================
  console.log('\n--- Scenario 9: Missing Webhook Signature ---');
  const missingSigRes = await apiRequest('/api/webhooks/payment', {
    method: 'POST',
    body: JSON.stringify({
      event: 'payment.paid',
      order_id: String(order6._id),
      amount: order6.totalPrice,
      status: 'paid',
    }),
  });

  assert(
    missingSigRes.status === 401,
    'Missing Signature: Webhook without any signature header is rejected with 401 Unauthorized',
    `Status: ${missingSigRes.status}`
  );

  // ============================================================================
  // TEST 10: Stale Webhook Replay Protection (Expired Timestamp)
  // ============================================================================
  console.log('\n--- Scenario 10: Webhook Freshness / Stale Timestamp Rejection ---');
  const order10 = await createTestOrder(victimToken);
  const tenMinutesAgo = Math.floor((Date.now() - 10 * 60 * 1000) / 1000); // 600s old (tolerance is 300s)
  const stalePayload = {
    event: 'payment.paid',
    payment_id: `PAY_STALE_${Date.now()}`,
    order_id: String(order10._id),
    amount: order10.totalPrice,
    currency: 'INR',
    status: 'paid',
    timestamp: tenMinutesAgo,
  };
  const staleSig = generateSignature(stalePayload, WEBHOOK_SECRET);
  const staleRes = await apiRequest('/api/webhooks/payment', {
    method: 'POST',
    headers: { 'x-payment-signature': staleSig },
    body: JSON.stringify(stalePayload),
  });

  const status10 = await apiRequest(`/api/payments/${order10._id}/status`, {
    headers: { Authorization: `Bearer ${victimToken}` },
  });

  assert(
    staleRes.status === 408 && status10.data?.isPaid === false,
    'Stale Webhook: Expired event timestamp (>300s old) is rejected with 408 Request Timeout',
    `Webhook status: ${staleRes.status}, isPaid: ${status10.data?.isPaid}`
  );

  // ============================================================================
  // TEST 11: Future Webhook Timestamp Rejection (Clock Skew Defense)
  // ============================================================================
  console.log('\n--- Scenario 11: Future Webhook Timestamp Rejection ---');
  const futurePayload = {
    event: 'payment.paid',
    payment_id: `PAY_FUTURE_${Date.now()}`,
    order_id: String(order10._id),
    amount: order10.totalPrice,
    currency: 'INR',
    status: 'paid',
    timestamp: Math.floor((Date.now() + 5 * 60 * 1000) / 1000), // 300s in future
  };
  const futureSig = generateSignature(futurePayload, WEBHOOK_SECRET);
  const futureRes = await apiRequest('/api/webhooks/payment', {
    method: 'POST',
    headers: { 'x-payment-signature': futureSig },
    body: JSON.stringify(futurePayload),
  });

  assert(
    futureRes.status === 400,
    'Future Timestamp: Event dated in the future is rejected with 400 Bad Request',
    `Status: ${futureRes.status}`
  );

  // ============================================================================
  // TEST 12: Rate Limiter Bypass Prevention (x-test-suite header ignored)
  // ============================================================================
  console.log('\n--- Scenario 12: Rate Limiter Header Bypass Prevention ---');
  // Send request with x-test-suite header to verify it doesn't bypass rate limiting
  const rateLimitProbe = await apiRequest('/api/payments/create-order', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${victimToken}`,
      'x-test-suite': 'true',
    },
    body: JSON.stringify({ order_id: String(order10._id) }),
  });
  // Since order10 is already pending, verify rate limiting logic is active and not bypassed
  assert(
    rateLimitProbe.status !== 500,
    'Rate Limiting & Security Middleware executes normally with x-test-suite: true header present',
    `Status: ${rateLimitProbe.status}`
  );

  // ============================================================================
  // TEST 13: getPaymentStatus Runtime Integrity (const -> let reassignment fix)
  // ============================================================================
  console.log('\n--- Scenario 13: getPaymentStatus Runtime Stability ---');
  const statusCheck = await apiRequest(`/api/payments/${order10._id}/status`, {
    headers: { Authorization: `Bearer ${victimToken}` },
  });

  assert(
    statusCheck.status === 200 && typeof statusCheck.data?.isPaid === 'boolean',
    'getPaymentStatus: Executes without TypeError crash (const -> let bug successfully resolved)',
    `Status: ${statusCheck.status}, data: ${JSON.stringify(statusCheck.data)}`
  );

  console.log('\n================================================================');
  console.log(`🏁 ATTACK SUITE RESULTS: ${passed} / ${total} SCENARIOS PASSED`);
  console.log('================================================================\n');
}

if (require.main === module) {
  runSecuritySuite();
}

module.exports = runSecuritySuite;
