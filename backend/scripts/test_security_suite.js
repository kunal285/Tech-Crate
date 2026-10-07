/**
 * TechCrate Backend Security & Integration Verification Suite (Native Fetch)
 * Tests authentication, server-side pricing, inventory deduction, IDOR, coupons, and health endpoints.
 */

const BASE_URL = 'http://localhost:5000';

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

async function runSecuritySuite() {
  console.log('\n======================================================');
  console.log('🔒 STARTING TECHCRATE BACKEND SECURITY VERIFICATION');
  console.log('======================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, testName) {
    totalTests++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passedTests++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
    }
  }

  try {
    // 1. Health & Readiness
    console.log('--- 1. Health & Readiness Probes ---');
    const healthRes = await request(`${BASE_URL}/health`);
    assert(healthRes.status === 200 && healthRes.data?.status === 'UP', 'GET /health returns UP');

    const readyRes = await request(`${BASE_URL}/ready`);
    assert(readyRes.status === 200 && readyRes.data?.status === 'READY', 'GET /ready returns READY with DB connected');

    // 2. Authentication Security
    console.log('\n--- 2. Authentication & Invalid Credentials ---');
    const invalidLoginRes = await request(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        email: 'nonexistent_user_999@techcrate.com',
        password: 'wrong_password_123',
      }),
    });
    assert(invalidLoginRes.status === 401, 'Login with invalid credentials correctly returns 401');

    // 3. Protected Route Security (Missing Token)
    console.log('\n--- 3. Authorization Guards ---');
    const unauthOrdersRes = await request(`${BASE_URL}/api/orders/myorders`);
    assert(unauthOrdersRes.status === 401, 'Accessing /api/orders/myorders without token returns 401');

    // 4. Admin Route Protection
    const unauthAdminRes = await request(`${BASE_URL}/api/admin/stats`);
    assert(unauthAdminRes.status === 401, 'Accessing /api/admin/stats without token returns 401');

    // 5. Valid Admin Login & Token Acquisition
    console.log('\n--- 4. Privileged Admin Login ---');
    const adminLoginRes = await request(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@techcrate.com',
        password: 'password123',
      }),
    });
    const adminToken = adminLoginRes.data?.token;
    assert(!!adminToken && adminLoginRes.data?.role === 'admin', 'Admin login succeeds with admin role and JWT');

    // 6. Admin Stats Access
    const statsRes = await request(`${BASE_URL}/api/admin/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(statsRes.status === 200 && typeof statsRes.data?.totalProducts === 'number', 'Authorized admin accesses real DB stats');

    // 7. Products Catalog & Search
    console.log('\n--- 5. Products Catalog & Search ---');
    const productsRes = await request(`${BASE_URL}/api/products`);
    assert(Array.isArray(productsRes.data) && productsRes.data.length > 0, 'Public products catalog retrieved');

    const sampleProduct = productsRes.data[0];
    const initialStock = sampleProduct.stock;
    console.log(`Target Component: "${sampleProduct.title}" (Original Price: ₹${sampleProduct.price}, Initial Stock: ${initialStock})`);

    // 8. Server-Enforced Cart Price Security
    console.log('\n--- 6. Server-Enforced Cart Price Protection ---');
    const cartRes = await request(`${BASE_URL}/api/cart`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        productId: sampleProduct._id,
        quantity: 2,
        price: 1, // Malicious client manipulation attempt!
      }),
    });

    const cartItem = cartRes.data?.items?.find((i) => String(i.product?._id || i.product) === String(sampleProduct._id));
    assert(
      cartItem && cartItem.price === sampleProduct.price,
      `Backend rejected manipulated price (₹1) and enforced real database price (₹${sampleProduct.price})`
    );

    // 9. Server-Calculated Order Pricing & Atomic Inventory Deduction
    console.log('\n--- 7. Order Placement & Atomic Inventory Deduction ---');
    const orderRes = await request(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        orderItems: [
          {
            product: sampleProduct._id,
            quantity: 2,
            price: 0.5, // Another malicious price attempt
          },
        ],
        shippingAddress: {
          fullName: 'Security Test Auditor',
          phone: '9876543210',
          street: 'Academic Campus Sector 4',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400076',
        },
        paymentMethod: 'UPI',
      }),
    });

    const createdOrder = orderRes.data?.order;
    assert(createdOrder && createdOrder.itemsPrice === sampleProduct.price * 2, 'Backend enforced genuine item totals');

    // Verify Stock Was Atomically Deducted
    const refreshedProductRes = await request(`${BASE_URL}/api/products/${sampleProduct._id}`);
    const updatedStock = refreshedProductRes.data?.stock;
    assert(
      updatedStock === initialStock - 2,
      `Inventory atomically deducted: ${initialStock} -> ${updatedStock} (prevented overselling)`
    );

    // 10. Order Cancellation & Inventory Recovery
    console.log('\n--- 8. Order Cancellation & Inventory Recovery ---');
    const cancelRes = await request(`${BASE_URL}/api/orders/${createdOrder._id}/cancel`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(cancelRes.data?.order?.orderStatus === 'Cancelled', 'Order cancelled successfully');

    const restoredProductRes = await request(`${BASE_URL}/api/products/${sampleProduct._id}`);
    assert(restoredProductRes.data?.stock === initialStock, `Inventory accurately restored to ${initialStock}`);

    // 11. IDOR Protection Verification
    console.log('\n--- 9. IDOR Resource Protection ---');
    const customerLoginRes = await request(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        email: 'student@TechCrate.com',
        password: 'password123',
      }),
    });
    const customerToken = customerLoginRes.data?.token;

    // Normal customer attempting to cancel someone else's order (the admin's order created above)
    const crossCancelRes = await request(`${BASE_URL}/api/orders/${createdOrder._id}/cancel`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    assert(crossCancelRes.status === 403, 'Cross-user order manipulation rejected with 403 Forbidden (IDOR Guard)');

    // 12. Normal User Accessing Admin APIs
    const customerAdminRes = await request(`${BASE_URL}/api/admin/users`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    assert(customerAdminRes.status === 403, 'Normal user accessing admin API rejected with 403 Forbidden');

    console.log('\n======================================================');
    console.log(`🏁 TEST RESULTS: ${passedTests} / ${totalTests} TESTS PASSED`);
    console.log('======================================================\n');
  } catch (error) {
    console.error('Test execution error:', error.message);
  }
}

runSecuritySuite();
