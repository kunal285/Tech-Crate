const CheckoutSession = require('../models/CheckoutSession');
const Product = require('../models/Product');
const ProjectKit = require('../models/ProjectKit');
const Coupon = require('../models/Coupon');
const razorpayService = require('../services/razorpayService');

// @desc Initiate a checkout session — reserves inventory and creates a Razorpay order
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

    // ── 3. Tax & shipping ─────────────────────────────────────────────────────
    const discountedSubtotal = Math.max(0, itemsPrice - discountAmount);
    const shippingPrice = discountedSubtotal >= 999 || discountedSubtotal === 0 ? 0 : 70;
    const taxPrice = Math.round(discountedSubtotal * 0.18); // 18% GST
    const totalPrice = discountedSubtotal + shippingPrice + taxPrice;

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
      discountApplied: discountAmount,
      coupon: appliedCoupon,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 min session
      reservedInventory: deductedItems,
    });

    await session.save();

    // ── 5. COD path — bypass Razorpay ─────────────────────────────────────────
    if (paymentMethod === 'COD') {
      return res.status(201).json({
        success: true,
        session_id: session._id,
        payment_method: 'COD',
        amount: totalPrice,
        currency: 'INR',
        message: 'COD order session created. Confirm on the next step.',
      });
    }

    // ── 6. Create Razorpay Order ───────────────────────────────────────────────
    const rzpOrder = await razorpayService.createOrder({
      orderId: session._id.toString(),
      amount: totalPrice,
      currency: 'INR',
      notes: {
        customer_name: session.shippingAddress.fullName,
        customer_phone: session.shippingAddress.phone,
      },
    });

    // Store Razorpay order ID in session for webhook matching
    session.payment_id = rzpOrder.razorpay_order_id;
    await session.save();

    return res.status(201).json({
      success: true,
      session_id: session._id,
      razorpay_order_id: rzpOrder.razorpay_order_id,
      razorpay_key_id: rzpOrder.key_id,
      amount: rzpOrder.amount,          // in paise
      amount_display: totalPrice,       // in rupees for display
      currency: rzpOrder.currency,
      is_sandbox: rzpOrder.isSandbox || false,
      // Prefill data for Razorpay checkout modal
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
