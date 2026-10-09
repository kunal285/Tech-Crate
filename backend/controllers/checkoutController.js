const CheckoutSession = require('../models/CheckoutSession');
const Product = require('../models/Product');
const ProjectKit = require('../models/ProjectKit');
const Coupon = require('../models/Coupon');
const autoUpiService = require('../services/autoUpiService');
const crypto = require('crypto');

// @desc Initiate a checkout session (reserves inventory and gets payment URL)
// @route POST /api/checkout/initiate
const initiateCheckout = async (req, res) => {
  const deductedItems = [];
  try {
    const { orderItems, shippingAddress, paymentMethod = 'UPI', couponCode, redirect_url, failure_url, webhook_url } = req.body;

    if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
      return res.status(400).json({ message: 'Order must contain at least one item.' });
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.street || !shippingAddress.city) {
      return res.status(400).json({ message: 'Complete shipping address is required.' });
    }

    // 1. Server-side price calculation & atomic inventory reservation
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
        if (!kit) {
          throw new Error(`Project kit ${kitId} not found.`);
        }
        verifiedPrice = kit.price;
        title = kit.title;
        image = kit.image || image;

        validatedItems.push({
          title, quantity: qty, image, price: verifiedPrice, projectKit: kit._id, itemType: 'kit',
        });
      } else {
        const productId = item.product || item._id;
        
        // Atomically reserve inventory
        const product = await Product.findOneAndUpdate(
          { _id: productId, stock: { $gte: qty } },
          { $inc: { stock: -qty } },
          { new: true }
        );

        if (!product) {
          throw new Error(`Insufficient stock for product ID "${productId}".`);
        }

        deductedItems.push({ productId, quantity: qty });

        verifiedPrice = product.price;
        title = product.title;
        image = (product.images && product.images[0]) || image;

        validatedItems.push({
          title, quantity: qty, image, price: verifiedPrice, product: product._id, itemType: 'product',
        });
      }

      itemsPrice += verifiedPrice * qty;
    }

    // 2. Server-side coupon verification & discount application
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

    // 3. Tax and Shipping calculations
    const discountedSubtotal = Math.max(0, itemsPrice - discountAmount);
    const shippingPrice = discountedSubtotal >= 999 || discountedSubtotal === 0 ? 0 : 70;
    const taxPrice = Math.round(discountedSubtotal * 0.18); // 18% standard GST
    const totalPrice = discountedSubtotal + shippingPrice + taxPrice;

    // 4. Create the CheckoutSession
    const session = new CheckoutSession({
      user: req.user._id,
      orderItems: validatedItems,
      shippingAddress: {
        fullName: shippingAddress.fullName.trim(),
        phone: shippingAddress.phone || req.user.phone || 'N/A',
        street: shippingAddress.street || shippingAddress.addressLine1 || 'Campus/Street',
        city: shippingAddress.city || 'City',
        state: shippingAddress.state || 'State',
        pincode: shippingAddress.pincode || shippingAddress.postalCode || '000000',
        country: shippingAddress.country || 'India',
      },
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      discountApplied: discountAmount,
      coupon: appliedCoupon,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 mins expiry
      reservedInventory: deductedItems
    });

    await session.save();

    // If COD, we might just bypass AutoUPI and convert directly to Order
    if (paymentMethod === 'COD') {
      // For now, let's just return the session and let the client know.
      // But COD usually confirms immediately. We will handle COD in another endpoint or directly here.
      // Assuming online payment for now.
    }

    // 5. Generate Payment Intent with AutoUPI
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomHex = crypto.randomBytes(4).toString('hex').toUpperCase();
    const payment_reference = `PAY-${dateStr}-${randomHex}`;
    
    session.payment_id = payment_reference;

    const defaultSuccessRedirect = process.env.PAYMENT_SUCCESS_REDIRECT_URL || 'techcrate://payment/success';
    const defaultFailedRedirect = process.env.PAYMENT_FAILED_REDIRECT_URL || 'techcrate://payment/failed';
    const globalWebhookUrl = process.env.PAYMENT_GLOBAL_WEBHOOK_URL || `${req.protocol}://${req.get('host')}/api/webhooks/payment`;

    const finalSuccessRedirectUrl = redirect_url || `${defaultSuccessRedirect}?session_id=${session._id}&status=paid`;
    const finalFailedRedirectUrl = failure_url || `${defaultFailedRedirect}?session_id=${session._id}&status=failed`;
    const finalWebhookUrl = webhook_url || globalWebhookUrl;

    const autoUpiResponse = await autoUpiService.createOrder({
      orderId: session._id.toString(), // Use session ID as gateway order ID
      amount: totalPrice,
      customerName: session.shippingAddress.fullName,
      customerEmail: req.user.email || 'customer@techcrate.com',
      customerMobile: session.shippingAddress.phone,
      redirectUrl: finalSuccessRedirectUrl,
      failureUrl: finalFailedRedirectUrl,
      webhookUrl: finalWebhookUrl,
    });

    session.payment_url = autoUpiResponse.paymentUrl || null;
    await session.save();

    res.status(201).json({
      success: true,
      session_id: session._id,
      payment_id: payment_reference,
      amount: totalPrice,
      currency: 'INR',
      payment_url: session.payment_url,
      redirect_url: finalSuccessRedirectUrl,
      is_fallback: autoUpiResponse.isFallback || false,
      upi_intent_url: autoUpiResponse.upiIntentUrl,
      qr_data: autoUpiResponse.qrData,
    });

  } catch (error) {
    // Rollback deducted inventory if checkout initialization fails midway
    for (const item of deductedItems) {
      await Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.quantity } }).catch(() => {});
    }

    res.status(400).json({ message: error.message || 'Failed to initiate checkout.' });
  }
};

module.exports = {
  initiateCheckout,
};
