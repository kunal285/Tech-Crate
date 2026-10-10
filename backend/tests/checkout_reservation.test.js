const crypto = require('crypto');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const jwt = require('jsonwebtoken');

const Product = require('../models/Product');
const Order = require('../models/Order');
const CheckoutSession = require('../models/CheckoutSession');
const WebhookEvent = require('../models/WebhookEvent');
const User = require('../models/User');
const IdempotencyKey = require('../models/IdempotencyKey');
const razorpayService = require('../services/razorpayService');
const { toPaise, toRupees, calculateOrderTotals } = require('../utils/money');

let mongoServer;
let app;
let testUser;
let testUserToken;

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test_jwt_secret_key_32_bytes_super_secure';
  process.env.RAZORPAY_WEBHOOK_SECRET = 'whsec_test_secret_12345';
  process.env.RAZORPAY_KEY_ID = 'rzp_test_mock_id';
  process.env.RAZORPAY_KEY_SECRET = 'rzp_test_mock_secret';

  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  await mongoose.connect(uri);

  app = require('../server');

  // Create test customer
  testUser = await User.create({
    name: 'Priya Sharma',
    email: 'priya@example.com',
    password: 'password123',
    role: 'customer',
  });

  testUserToken = jwt.sign(
    { id: testUser._id, role: 'customer' },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

describe('Module 2: Transactional Money, Stock Reservation & Idempotent Checkout', () => {
  describe('1. Authoritative Money Utilities (Rupees & Paise)', () => {
    it('correctly converts rupees to integer paise without floating point inaccuracy', () => {
      expect(toPaise(349)).toBe(34900);
      expect(toPaise(19.99)).toBe(1999);
      expect(toPaise(0)).toBe(0);
    });

    it('correctly converts paise to rupees with 2 decimal precision', () => {
      expect(toRupees(34900)).toBe(349);
      expect(toRupees(1999)).toBe(19.99);
    });

    it('computes 18% GST (CGST/SGST split) and enforces shipping thresholds', () => {
      // Below 999: shipping is 70
      const sub999 = calculateOrderTotals({ itemsPrice: 500, discountAmount: 0 });
      expect(sub999.itemsPrice).toBe(500);
      expect(sub999.shippingPrice).toBe(70);
      expect(sub999.taxPrice).toBe(90); // 18% of 500
      expect(sub999.cgstPrice).toBe(45);
      expect(sub999.sgstPrice).toBe(45);
      expect(sub999.totalPrice).toBe(660);
      expect(sub999.totalPricePaise).toBe(66000);

      // Above 999: free shipping
      const over999 = calculateOrderTotals({ itemsPrice: 1200, discountAmount: 0 });
      expect(over999.shippingPrice).toBe(0);
      expect(over999.taxPrice).toBe(216); // 18% of 1200
      expect(over999.totalPrice).toBe(1416);
      expect(over999.totalPricePaise).toBe(141600);
    });
  });

  describe('2. Concurrent Stock Reservation Race Condition Protection', () => {
    it('prevents overselling when 2 concurrent requests compete for the last single unit in stock', async () => {
      const singleStockProduct = await Product.create({
        title: 'Rare Microcontroller Board',
        price: 999,
        stock: 1,
        category: 'Microcontrollers',
        description: 'Last unit test board',
      });

      const checkoutPayload = {
        orderItems: [
          {
            product: singleStockProduct._id.toString(),
            quantity: 1,
            title: 'Rare Microcontroller Board',
            price: 999,
          },
        ],
        shippingAddress: {
          fullName: 'Priya Sharma',
          street: '123 MG Road',
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: '560001',
          phone: '9876543210',
        },
        paymentMethod: 'COD',
      };

      // Launch 2 simultaneous checkout requests for the same single unit
      const [res1, res2] = await Promise.all([
        request(app)
          .post('/api/checkout/initiate')
          .set('Authorization', `Bearer ${testUserToken}`)
          .send(checkoutPayload),
        request(app)
          .post('/api/checkout/initiate')
          .set('Authorization', `Bearer ${testUserToken}`)
          .send(checkoutPayload),
      ]);

      const statuses = [res1.status, res2.status];
      // Exactly one must succeed (201) and the other must fail (400)
      expect(statuses).toContain(201);
      expect(statuses).toContain(400);

      // Verify stock in database is now exactly 0, never negative
      const updatedProduct = await Product.findById(singleStockProduct._id);
      expect(updatedProduct.stock).toBe(0);
    });
  });

  describe('3. Idempotent Order Creation & Idempotency-Key Header', () => {
    it('returns the exact same response without deducting additional inventory on replayed Idempotency-Key', async () => {
      const stockProduct = await Product.create({
        title: 'Arduino Uno R4 WiFi',
        price: 1500,
        stock: 10,
        category: 'Microcontrollers',
        description: 'Microcontroller for robotics',
      });

      const idempotencyKey = `idem_${Date.now()}_abc123`;
      const orderPayload = {
        orderItems: [
          {
            product: stockProduct._id.toString(),
            quantity: 2,
            title: 'Arduino Uno R4 WiFi',
            price: 1500,
          },
        ],
        shippingAddress: {
          fullName: 'Priya Sharma',
          street: '123 MG Road',
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: '560001',
          phone: '9876543210',
        },
        paymentMethod: 'COD',
      };

      // First request
      const firstRes = await request(app)
        .post('/api/checkout/initiate')
        .set('Authorization', `Bearer ${testUserToken}`)
        .set('Idempotency-Key', idempotencyKey)
        .send(orderPayload);

      expect(firstRes.status).toBe(201);
      const firstSessionId = firstRes.body.session_id;
      const firstOrderId = firstRes.body.order_id;
      expect(firstOrderId).toBeDefined();

      // Check stock after first request (initial 10 - 2 = 8)
      const intermediateProduct = await Product.findById(stockProduct._id);
      expect(intermediateProduct.stock).toBe(8);

      // Replay identical request with same Idempotency-Key
      const replayedRes = await request(app)
        .post('/api/checkout/initiate')
        .set('Authorization', `Bearer ${testUserToken}`)
        .set('Idempotency-Key', idempotencyKey)
        .send(orderPayload);

      expect(replayedRes.status).toBe(201);
      expect(replayedRes.headers['x-idempotent-replayed']).toBe('true');
      expect(replayedRes.body.session_id).toBe(firstSessionId);
      expect(replayedRes.body.order_id).toBe(firstOrderId);

      // Inventory must remain 8 — NOT decremented a second time
      const finalProduct = await Product.findById(stockProduct._id);
      expect(finalProduct.stock).toBe(8);
    });
  });

  describe('4. Razorpay Webhook Signature Verification & Replay Protection', () => {
    it('verifies valid HMAC SHA256 signature and rejects tampered signatures', () => {
      const secret = 'whsec_test_secret_12345';
      const payload = JSON.stringify({
        event: 'payment.captured',
        payload: { payment: { entity: { id: 'pay_test_123', amount: 50000 } } },
      });

      const validSignature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');

      const isValid = razorpayService.verifyWebhookSignature(payload, validSignature);
      expect(isValid).toBe(true);

      const isTampered = razorpayService.verifyWebhookSignature(
        payload,
        '0000000000000000000000000000000000000000000000000000000000000000'
      );
      expect(isTampered).toBe(false);
    });

    it('processes webhook and safely deduplicates repeated event deliveries using WebhookEvent', async () => {
      const testOrder = await Order.create({
        order_id: `ORD-TEST-${Date.now()}`,
        user: testUser._id,
        orderItems: [
          {
            title: 'Breadboard Jumper Wires',
            quantity: 1,
            price: 199,
          },
        ],
        shippingAddress: {
          fullName: 'Priya Sharma',
          street: '123 MG Road',
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: '560001',
          phone: '9876543210',
        },
        paymentMethod: 'Razorpay',
        totalPrice: 199,
        isPaid: false,
      });

      const webhookPayload = {
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              id: `pay_dedup_${Date.now()}`,
              order_id: testOrder.order_id,
              amount: 19900,
              currency: 'INR',
              status: 'captured',
            },
          },
        },
      };

      const rawBody = JSON.stringify(webhookPayload);
      const signature = crypto
        .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
        .update(rawBody)
        .digest('hex');

      // First webhook delivery
      const firstWebhookRes = await request(app)
        .post('/api/payments/webhook')
        .set('x-razorpay-signature', signature)
        .send(webhookPayload);

      expect(firstWebhookRes.status).toBe(200);

      // Verify order is now marked paid
      const updatedOrder = await Order.findById(testOrder._id);
      expect(updatedOrder.isPaid).toBe(true);
      expect(updatedOrder.orderStatus).toBe('Processing');

      // Second webhook delivery (duplicate replay)
      const duplicateWebhookRes = await request(app)
        .post('/api/payments/webhook')
        .set('x-razorpay-signature', signature)
        .send(webhookPayload);

      expect(duplicateWebhookRes.status).toBe(200);
      expect(duplicateWebhookRes.body.processed).toBe(true);
      expect(duplicateWebhookRes.body.message).toMatch(/Already processed/i);
    });
  });
});
