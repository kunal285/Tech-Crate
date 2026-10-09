const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const BASE_URL = 'http://localhost:5000/api';
const SECRET = process.env.PAYMENT_WEBHOOK_SECRET || 'whsec_132d2f1554d82b5516ec2e088442f895db6116b5a1f33a8c'; // from .env
const JWT_SECRET = 'f03c6784a07fcc5e6ebc57adbcbccccb54f254790202552925ef803337fd4a5f8041fa4961b5536ba710d4f2bcd39684';

// Create mock auth token
const token = jwt.sign({ id: '60d5ecb54ab9a11f2c2b8c98', role: 'user' }, JWT_SECRET, { expiresIn: '1h' });

async function runTest() {
  try {
    console.log('1. Initiating Checkout...');
    const initReq = await fetch(`${BASE_URL}/checkout/initiate`, {
      method: 'POST',
      headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        orderItems: [{
          title: 'Test Product',
          quantity: 1,
          price: 999,
          product: '60d5ecb54ab9a11f2c2b8c99',
          itemType: 'product'
        }],
        shippingAddress: {
          fullName: 'Test User',
          phone: '9999999999',
          street: 'Test Street',
          city: 'Test City',
          state: 'Test State',
          pincode: '123456'
        },
        paymentMethod: 'UPI',
        redirect_url: 'http://localhost/success',
        failure_url: 'http://localhost/failed',
        webhook_url: 'http://localhost/webhook'
      })
    });
    const initRes = await initReq.json();
    console.log('Initiate Response:', initRes);

    if (!initRes.session_id) {
        console.error('Failed to get session ID');
        return;
    }

    const sessionId = initRes.session_id;

    console.log('\n2. Testing Webhook...');
    const payload = {
      event: 'payment.paid',
      order_id: sessionId,
      txnId: 'txn_12345',
      amount: 999,
      currency: 'INR'
    };

    const signature = crypto.createHmac('sha256', SECRET).update(JSON.stringify(payload)).digest('hex');

    const webhookReq = await fetch(`${BASE_URL}/webhooks/payment`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-webhook-signature': signature 
      },
      body: JSON.stringify(payload)
    });
    const webhookRes = await webhookReq.json();
    console.log('Webhook Response:', webhookRes);

    console.log('\n3. Verifying Final Status...');
    const statusReq = await fetch(`${BASE_URL}/payments/${sessionId}/status`);
    const statusRes = await statusReq.json();
    console.log('Status Response:', statusRes);

  } catch (err) {
    console.error('Test failed:', err.message);
  }
}

runTest();
