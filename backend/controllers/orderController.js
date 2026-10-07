const Order = require('../models/Order');
const Product = require('../models/Product');
const ProjectKit = require('../models/ProjectKit');
const Coupon = require('../models/Coupon');
const Cart = require('../models/Cart');

// @desc Create new order with server-enforced pricing, coupon validation & atomic inventory deduction
// @route POST /api/orders
const createOrder = async (req, res) => {
  const deductedItems = [];
  try {
    const { orderItems, shippingAddress, paymentMethod = 'UPI', couponCode } = req.body;

    if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
      return res.status(400).json({ message: 'Order must contain at least one item.' });
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.street || !shippingAddress.city) {
      return res.status(400).json({ message: 'Complete shipping address is required.' });
    }

    // 1. Server-side price calculation & inventory verification
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
          title,
          quantity: qty,
          image,
          price: verifiedPrice,
          projectKit: kit._id,
          itemType: 'kit',
        });
      } else {
        const productId = item.product || item._id;
        const product = await Product.findById(productId);
        if (!product) {
          throw new Error(`Product not found.`);
        }

        // Atomic inventory deduction to prevent race conditions & negative stock
        const updatedProduct = await Product.findOneAndUpdate(
          { _id: productId, stock: { $gte: qty } },
          { $inc: { stock: -qty } },
          { new: true }
        );

        if (!updatedProduct) {
          throw new Error(`Insufficient stock for "${product.title}". Only ${product.stock} units remaining.`);
        }

        deductedItems.push({ productId, quantity: qty });

        verifiedPrice = product.price;
        title = product.title;
        image = (product.images && product.images[0]) || image;

        validatedItems.push({
          title,
          quantity: qty,
          image,
          price: verifiedPrice,
          product: product._id,
          itemType: 'product',
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

          // Record coupon usage
          await Coupon.findByIdAndUpdate(coupon._id, { $inc: { usageCount: 1 } });
          appliedCoupon = cleanCode;
        }
      }
    }

    // 3. Tax and Shipping calculations
    const discountedSubtotal = Math.max(0, itemsPrice - discountAmount);
    const shippingPrice = discountedSubtotal >= 999 || discountedSubtotal === 0 ? 0 : 70;
    const taxPrice = Math.round(discountedSubtotal * 0.18); // 18% standard GST
    const totalPrice = discountedSubtotal + shippingPrice + taxPrice;

    // 4. Create the verified order
    const order = new Order({
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
      isPaid: paymentMethod === 'COD' ? false : true, // Simulated live payment for in-app flow, COD pending
      paidAt: paymentMethod === 'COD' ? null : new Date(),
      orderStatus: 'Processing',
    });

    const createdOrder = await order.save();

    // 5. Clear user's cart on successful checkout
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: createdOrder,
      discountApplied: discountAmount,
      coupon: appliedCoupon,
    });

    // Asynchronously dispatch background side-effects (Email, Push, Invoice) without blocking response
    const queueService = require('../services/queueService');
    queueService.dispatchOrderProcessing(createdOrder, req.user);
  } catch (error) {
    // Rollback deducted inventory if order creation fails midway
    for (const item of deductedItems) {
      await Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.quantity } }).catch(() => {});
    }

    res.status(400).json({ message: error.message || 'Failed to place order.' });
  }
};

// @desc Get logged-in customer's own orders (strictly scoped to req.user._id)
// @route GET /api/orders/myorders
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get order by ID with strict IDOR ownership check
// @route GET /api/orders/:id
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('orderItems.product');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // IDOR Protection: Only the customer who placed the order or an Admin can access
    const isOwner = order.user && order.user._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Forbidden: You do not have permission to view this order.' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Cancel an order (Allowed only if Pending or Processing; restores inventory)
// @route PUT /api/orders/:id/cancel
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const isOwner = order.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to cancel this order' });
    }

    if (!['Pending', 'Processing'].includes(order.orderStatus)) {
      return res.status(400).json({
        message: `Cannot cancel an order that is already '${order.orderStatus}'.`,
      });
    }

    order.orderStatus = 'Cancelled';
    await order.save();

    // Restore inventory
    for (const item of order.orderItems) {
      if (item.product) {
        await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } }).catch(() => {});
      }
    }

    res.json({ success: true, message: 'Order has been cancelled and inventory restored.', order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Update order status (Admin / Seller only)
// @route PUT /api/orders/:id/status
const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const previousStatus = order.orderStatus;
    order.orderStatus = orderStatus;
    if (orderStatus === 'Delivered') {
      order.deliveredAt = new Date();
    }
    await order.save();

    const { logAdminAction } = require('../services/auditService');
    await logAdminAction({
      req,
      action: 'ORDER_STATUS_UPDATED',
      targetType: 'Order',
      targetId: order._id,
      previousState: { status: previousStatus },
      newState: { status: orderStatus },
    });

    res.json({ message: `Order status updated to ${orderStatus}`, order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get all orders (Admin only)
// @route GET /api/orders
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  updateOrderStatus,
  getAllOrders,
};
