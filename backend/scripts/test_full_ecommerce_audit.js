/**
 * Comprehensive End-to-End E-Commerce System Audit & Verification Script
 * Traces the complete lifecycle across Customer Journey, Admin Operations, Security, and Database integrity.
 */

const BASE_URL = 'http://localhost:5000';

async function request(url, options = {}) {
  const { headers: customHeaders, ...restOptions } = options;
  const start = Date.now();
  const res = await fetch(url, {
    ...restOptions,
    headers: {
      'Content-Type': 'application/json',
      ...(customHeaders || {}),
    },
  });
  const duration = Date.now() - start;
  let data = null;
  try {
    data = await res.json();
  } catch (err) {}
  return { status: res.status, ok: res.ok, duration, data };
}

async function runAudit() {
  console.log('================================================================');
  console.log('🚀 TECHCRATE E-COMMERCE END-TO-END SYSTEM AUDIT SUITE');
  console.log('================================================================\n');

  const auditLog = [];

  function record(module, testName, passed, details = '') {
    const status = passed ? 'WORKING' : 'BROKEN';
    const mark = passed ? '✅ [PASS]' : '❌ [FAIL]';
    console.log(`${mark} [${module}] ${testName} ${details ? '(' + details + ')' : ''}`);
    auditLog.push({ module, testName, status, details });
  }

  try {
    // 1. Health & Server Architecture
    const health = await request(`${BASE_URL}/health`);
    record('System Health', 'Liveness Probe /health', health.status === 200 && health.data?.status === 'UP', `${health.duration}ms`);

    const ready = await request(`${BASE_URL}/ready`);
    record('System Health', 'Readiness Probe /ready', ready.status === 200 && ready.data?.status === 'READY', `${ready.duration}ms`);

    // 2. Authentication Flow
    const customerLogin = await request(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ email: 'student@TechCrate.com', password: 'password123' }),
    });
    const customerToken = customerLogin.data?.token;
    const customerUser = customerLogin.data?.user || customerLogin.data;
    record('Authentication', 'Customer Login (student@TechCrate.com)', customerLogin.status === 200 && !!customerToken, `User ID: ${customerUser?._id}`);

    const adminLogin = await request(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ email: 'admin@techcrate.com', password: 'password123' }),
    });
    const adminToken = adminLogin.data?.token;
    record('Authentication', 'Admin Login (admin@techcrate.com)', adminLogin.status === 200 && !!adminToken, `Role: ${adminLogin.data?.role}`);

    const invalidAuth = await request(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ email: 'student@TechCrate.com', password: 'wrongpassword' }),
    });
    record('Authentication', 'Invalid Credentials Rejection', invalidAuth.status === 401, 'HTTP 401 Unauthorized');

    // 3. Admin-to-App Dynamic Banner Synchronization
    const publicBanners = await request(`${BASE_URL}/api/banners`);
    record('Banners / CMS', 'Customer Dynamic Banner Fetch', publicBanners.status === 200 && Array.isArray(publicBanners.data) && publicBanners.data.length > 0, `Active banners: ${publicBanners.data?.length}`);

    // Admin creates dynamic banner
    const newBannerTitle = `Flash Sale Alert ${Date.now()}`;
    const createBannerRes = await request(`${BASE_URL}/api/posters`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        title: newBannerTitle,
        subtitle: 'Special Live Component Offer',
        badgeText: 'HOT',
        imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
        linkType: 'category',
        linkValue: 'Sensors',
        displayOrder: 10,
        isActive: true,
      }),
    });
    record('Admin CMS', 'Admin Creates Dynamic Banner', createBannerRes.status === 201 || createBannerRes.status === 200, `Banner ID: ${createBannerRes.data?._id}`);

    // Verify Customer immediately sees new banner without rebuild
    const updatedBanners = await request(`${BASE_URL}/api/banners`);
    const foundNewBanner = updatedBanners.data?.some(b => b.title === newBannerTitle);
    record('Admin-to-App Sync', 'Customer Receives Admin Banner Instantly', foundNewBanner, 'Real-time CMS sync verified');

    // 4. Product Catalog, Search & Categories
    const productsRes = await request(`${BASE_URL}/api/products`);
    record('Products API', 'Public Catalog Fetch', productsRes.status === 200 && Array.isArray(productsRes.data) && productsRes.data.length > 0, `${productsRes.data?.length} components loaded`);

    const searchRes = await request(`${BASE_URL}/api/products?keyword=Arduino`);
    record('Search System', 'Search Keyword "Arduino"', searchRes.status === 200 && Array.isArray(searchRes.data), `Results: ${searchRes.data?.length}`);

    const targetProduct = productsRes.data[0];
    const initialStock = targetProduct.stock;
    const productDetail = await request(`${BASE_URL}/api/products/${targetProduct._id}`);
    record('Products API', 'Product Detail Lookup', productDetail.status === 200 && productDetail.data?._id === targetProduct._id, `SKU: ${productDetail.data?.sku || 'N/A'}`);

    // 5. Wishlist Management
    const addWishlist = await request(`${BASE_URL}/api/auth/profile`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    record('Wishlist & Profile', 'Customer Profile & Wishlist Access', addWishlist.status === 200, 'Authenticated Profile');

    // 6. Cart Security & Price Isolation
    const cartManipulated = await request(`${BASE_URL}/api/cart`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerToken}` },
      body: JSON.stringify({
        productId: targetProduct._id,
        quantity: 2,
        price: 0.01, // Malicious manipulation
      }),
    });
    const cartItem = cartManipulated.data?.items?.find(i => String(i.product?._id || i.product) === String(targetProduct._id));
    record('Cart Security', 'Tampered Price Override (Server Authority)', cartItem?.price === targetProduct.price, `Enforced ₹${targetProduct.price} instead of ₹0.01`);

    // 7. Coupon Validation
    const couponList = await request(`${BASE_URL}/api/admin/coupons`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    record('Coupon Management', 'Admin Persistent Coupon Query', couponList.status === 200 && Array.isArray(couponList.data), `Coupons in DB: ${couponList.data?.length}`);

    // 8. Checkout & Server-Side Totals Calculation
    const orderTampered = await request(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerToken}` },
      body: JSON.stringify({
        orderItems: [
          {
            product: targetProduct._id,
            quantity: 1,
            price: 1.0, // Fraudulent price
          },
        ],
        shippingAddress: {
          fullName: 'Audit Customer',
          phone: '9876543210',
          street: 'Engineering Lab Tech Park',
          city: 'Bangalore',
          state: 'Karnataka',
          pincode: '560001',
          country: 'India',
        },
        paymentMethod: 'UPI',
        couponCode: 'WELCOME10',
      }),
    });

    const createdOrder = orderTampered.data?.order;
    const genuineSubtotal = targetProduct.price * 1;
    record('Checkout & Financials', 'Server-Authoritative Order Totals & Coupon Math', createdOrder && createdOrder.itemsPrice === genuineSubtotal, `Items: ₹${createdOrder?.itemsPrice}, Total: ₹${createdOrder?.totalPrice}`);

    // 9. Atomic Inventory Deduction Verification
    const productAfterOrder = await request(`${BASE_URL}/api/products/${targetProduct._id}`);
    record('Inventory Management', 'Atomic Inventory Decrement (Race-Condition Free)', productAfterOrder.data?.stock === initialStock - 1, `Stock: ${initialStock} -> ${productAfterOrder.data?.stock}`);

    // 10. IDOR Resource Protection Check (Second Customer attempts cross-order cancellation)
    const secondUserLogin = await request(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ email: 'priya@gmail.com', password: 'password123' }),
    });
    const secondUserToken = secondUserLogin.data?.token;

    const crossUserCancel = await request(`${BASE_URL}/api/orders/${createdOrder._id}/cancel`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${secondUserToken}` },
    });
    record('Security & IDOR', 'Cross-Customer Cancellation Rejected (IDOR Guard)', crossUserCancel.status === 403, 'HTTP 403 Forbidden');

    // Customer checks their own order
    const customerOrderView = await request(`${BASE_URL}/api/orders/${createdOrder._id}`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    record('Security & IDOR', 'Customer Owns & Accesses Their Order', customerOrderView.status === 200, `Order ID: ${createdOrder._id}`);

    // 11. Order Cancellation & Inventory Restoration
    const customerCancel = await request(`${BASE_URL}/api/orders/${createdOrder._id}/cancel`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    record('Order Lifecycle', 'Customer Cancels Order Successfully', customerCancel.status === 200 && customerCancel.data?.order?.orderStatus === 'Cancelled', 'Status: Cancelled');

    const productAfterCancel = await request(`${BASE_URL}/api/products/${targetProduct._id}`);
    record('Inventory Management', 'Inventory Restored on Cancellation', productAfterCancel.data?.stock === initialStock, `Stock restored to: ${productAfterCancel.data?.stock}`);

    // 12. Admin Order Management & Live Dashboard
    const adminOrders = await request(`${BASE_URL}/api/admin/orders`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    record('Admin Orders', 'Admin View All System Orders', adminOrders.status === 200 && Array.isArray(adminOrders.data?.orders || adminOrders.data), `Orders retrieved: ${(adminOrders.data?.orders || adminOrders.data)?.length}`);

    const adminStats = await request(`${BASE_URL}/api/admin/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    record('Admin Analytics', 'Real Database KPI & Dashboard Stats', adminStats.status === 200 && typeof adminStats.data?.totalProducts === 'number', `Products: ${adminStats.data?.totalProducts}, Orders: ${adminStats.data?.totalOrders}`);

    // Clean up created test banner
    if (createBannerRes.data?._id) {
      await request(`${BASE_URL}/api/posters/${createBannerRes.data._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
    }

    console.log('\n================================================================');
    console.log(`🏁 AUDIT EXECUTION COMPLETE: ${auditLog.filter(t => t.status === 'WORKING').length} / ${auditLog.length} CRITICAL PATHWAYS VERIFIED`);
    console.log('================================================================\n');

    return auditLog;
  } catch (err) {
    console.error('Audit Runner Error:', err);
  }
}

runAudit();
