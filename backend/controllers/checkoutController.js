const crypto = require('crypto');
const CheckoutSession = require('../models/CheckoutSession');
const Order = require('../models/Order');
const Product = require('../models/Product');
const ProjectKit = require('../models/ProjectKit');
const Coupon = require('../models/Coupon');
const Cart = require('../models/Cart');
const autoUpiService = require('../services/autoUpiService');
const razorpayService = require('../services/razorpayService');
const { calculateOrderTotals } = require('../utils/money');

// @desc Initiate a checkout session — reserves inventory and creates an AutoUPI / Razorpay order
// @route POST /api/checkout/initiate
// @access Private
const initiateCheckout = async (req, res) => {
  const deductedItems = [];
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod = 'UPI',
      couponCode,
      redirect_url,
      failure_url,
    } = req.body;

    if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
      return res.status(400).json({ success: false, message: 'Order must contain at least one item.' });
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.street || !shippingAddress.city) {
      return res.status(400).json({ success: false, message: 'Complete shipping address is required.' });
    }

    // ── 1. Server-side price calculation & atomic inventory reservation ──────
    let itemsPrice = 0;
    const validatedItems = [];

    for (const item of orderItems) {
      const qty = Math.max(1, Number(item.quantity) || 1);
      let verifiedPrice = 0;
      let title = item.title || 'Component';
      let image = item.image || '';

      if (item.projectKit || item.itemType === 'kit') {
        const kitId = item.projectKit || item.product || item._id;
        const kit = await ProjectKit.findById(kitId);
        if (!kit) throw new Error(`Project kit ${kitId} not found.`);

        verifiedPrice = kit.price;
        title = kit.title;
        image = kit.image || image;
        validatedItems.push({ title, quantity: qty, image, price: verifiedPrice, projectKit: kit._id, itemType: 'kit' });
      } else {
        const productId = item.product || item._id;

        // Atomic stock decrement with optimistic locking
        const product = await Product.findOneAndUpdate(
          { _id: productId, stock: { $gte: qty } },
          { $inc: { stock: -qty } },
          { new: true }
        );

        if (!product) throw new Error(`Insufficient stock for product "${productId}".`);

        deductedItems.push({ productId, quantity: qty });
        verifiedPrice = product.price;
        title = product.title;
        image = (product.images && product.images[0]) || image;
        validatedItems.push({ title, quantity: qty, image, price: verifiedPrice, product: product._id, itemType: 'product' });
      }

      itemsPrice += verifiedPrice * qty;
    }

    // ── 2. Coupon verification ────────────────────────────────────────────────
    let discountAmount = 0;
    let appliedCoupon = null;

    if (couponCode) {
      const cleanCode = String(couponCode).toUpperCase().trim();
      const coupon = await Coupon.findOne({ code: cleanCode, active: true });

      if (coupon) {
        const isExpired = coupon.expiryDate && new Date(coupon.expiryDate) < new Date();
        const limitReached = coupon.usageLimit && coupon.usageCount >= coupon.usageLimit;
        const meetsMinOrder = itemsPrice >= (coupon.minOrder || 0);

        if (!isExpired && !limitReached && meetsMinOrder) {
          if (coupon.discountType === 'fixed') {
            discountAmount = Math.min(itemsPrice, coupon.discountValue);
          } else {
            const rawDiscount = Math.round((itemsPrice * coupon.discountValue) / 100);
            discountAmount = coupon.maxDiscount ? Math.min(rawDiscount, coupon.maxDiscount) : rawDiscount;
          }
          appliedCoupon = cleanCode;
        }
      }
    }

    // ── 3. Authoritative Tax & shipping calculation in INR & Paise ────────────
    const totals = calculateOrderTotals({ itemsPrice, discountAmount });
    const {
      shippingPrice,
      taxPrice,
      totalPrice,
      itemsPricePaise,
      taxPricePaise,
      shippingPricePaise,
      totalPricePaise,
    } = totals;

    // ── 4. Create CheckoutSession ──────────────────────────────────────────────
    const session = new CheckoutSession({
      user: req.user._id,
      orderItems: validatedItems,
      shippingAddress: {
        fullName: shippingAddress.fullName.trim(),
        phone: shippingAddress.phone || req.user.phone || 'N/A',
        street: shippingAddress.street || shippingAddress.addressLine1 || '',
        city: shippingAddress.city || '',
        state: shippingAddress.state || '',
        pincode: shippingAddress.pincode || shippingAddress.postalCode || '',
        country: shippingAddress.country || 'India',
      },
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      itemsPricePaise,
      taxPricePaise,
      shippingPricePaise,
      totalPricePaise,
      discountApplied: discountAmount,
      coupon: appliedCoupon,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 min session
      reservedInventory: deductedItems,
    });

    await session.save();

    // ── 5. COD path — finalize order immediately ──────────────────────────────
    if (paymentMethod === 'COD') {
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randomHex = crypto.randomBytes(2).toString('hex').toUpperCase();
      const newOrderId = `ORD-${dateStr}-${randomHex}`;

      const codOrder = new Order({
        order_id: newOrderId,
        user: req.user._id,
        orderItems: validatedItems,
        shippingAddress: session.shippingAddress,
        paymentMethod: 'COD',
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        itemsPricePaise,
        taxPricePaise,
        shippingPricePaise,
        totalPricePaise,
        isPaid: false,
        orderStatus: 'Placed',
        paymentResult: {
          id: `COD_${session._id}`,
          status: 'PENDING',
          updateTime: new Date().toISOString(),
        },
      });

      const savedCodOrder = await codOrder.save();

      session.sessionStatus = 'Completed';
      session.order_id = savedCodOrder.order_id;
      await session.save();

      // Clear user cart for placed COD order
      await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] }).catch(() => {});

      return res.status(201).json({
        success: true,
        session_id: session._id,
        order_id: savedCodOrder.order_id,
        final_order_id: savedCodOrder.order_id,
        payment_method: 'COD',
        amount: totalPrice,
        currency: 'INR',
        message: 'Order placed successfully with Cash on Delivery.',
      });
    }

    // ── 6. Create Online Payment Gateway Order ───────────────────────────────
    const frontendBase = process.env.FRONTEND_URL || 'http://localhost:3000';
    const backendBase = process.env.BACKEND_URL || `${req.protocol}://${req.get('host')}`;

    let autoUpiOrder = { isSandbox: false };
    let rzpOrder = null;

    if (paymentMethod === 'Razorpay') {
      try {
        rzpOrder = await razorpayService.createOrder({
          orderId: session._id.toString(),
          amount: totalPrice,
          currency: 'INR',
          notes: {
            session_id: session._id.toString(),
            customer_name: session.shippingAddress.fullName,
          },
        });
        if (rzpOrder?.razorpay_order_id) {
          session.payment_id = rzpOrder.razorpay_order_id;
        }
      } catch (err) {
        console.warn('[Razorpay order creation error]', err.message);
      }
    } else {
      // AutoUPI hosted gateway
      autoUpiOrder = await autoUpiService.createOrder({
        orderId: session._id.toString(),
        amount: totalPrice,
        customerName: session.shippingAddress.fullName,
        customerEmail: req.user.email || 'customer@techcrate.com',
        customerMobile: session.shippingAddress.phone,
        redirectUrl: redirect_url || `${frontendBase}/payment/success?session_id=${session._id}`,
        failureUrl: failure_url || `${frontendBase}/payment/failed?session_id=${session._id}`,
        webhookUrl: `${backendBase}/api/webhooks/payment`,
      });
      session.payment_id = autoUpiOrder.gatewayOrderId || `UPI_${session._id}`;
      session.payment_url = autoUpiOrder.paymentUrl || null;
    }

    await session.save();

    return res.status(201).json({
      success: true,
      session_id: session._id,
      payment_method: paymentMethod,
      gateway: paymentMethod === 'Razorpay' ? 'Razorpay' : 'AutoUPI',
      payment_url: autoUpiOrder.paymentUrl || null,
      upi_intent_url: autoUpiOrder.upiIntentUrl || null,
      qr_data: autoUpiOrder.qrData || null,
      gateway_order_id: autoUpiOrder.gatewayOrderId || null,
      amount: totalPrice,
      amount_display: totalPrice,
      currency: 'INR',
      is_sandbox: paymentMethod === 'Razorpay' ? (rzpOrder?.isSandbox || false) : (autoUpiOrder.isSandbox || false),
      razorpay_order_id: rzpOrder?.razorpay_order_id,
      razorpay_key_id: rzpOrder?.key_id || process.env.RAZORPAY_KEY_ID || 'rzp_test_Tm3Zrmb9gAWjnG',
      razorpay_amount: rzpOrder?.amount || Math.round(Number(totalPrice) * 100),
      prefill: {
        name: session.shippingAddress.fullName,
        email: req.user.email || '',
        contact: session.shippingAddress.phone || req.user.phone || '',
      },
    });

  } catch (error) {
    // Roll back inventory if anything failed
    for (const item of deductedItems) {
      await Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.quantity } }).catch(() => {});
    }
    console.error('[initiateCheckout Error]', error.message);
    return res.status(400).json({ success: false, message: error.message || 'Failed to initiate checkout.' });
  }
};

module.exports = { initiateCheckout };
