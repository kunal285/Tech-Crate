const Order = require('../models/Order');

// @desc Create new order in MongoDB
// @route POST /api/orders
const createOrder = async (req, res) => {
  try {
    const { orderItems, shippingAddress, paymentMethod, totalPrice, itemsPrice, taxPrice, shippingPrice } = req.body;
    const order = new Order({
      user: req.user ? req.user._id : req.body.userId,
      orderItems: orderItems || [],
      shippingAddress: shippingAddress || {},
      paymentMethod: paymentMethod || 'UPI',
      itemsPrice: itemsPrice || totalPrice || 0,
      taxPrice: taxPrice || 0,
      shippingPrice: shippingPrice || 0,
      totalPrice: totalPrice || 0,
      isPaid: true,
      paidAt: new Date(),
      orderStatus: 'Processing',
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get logged in user orders directly from MongoDB
// @route GET /api/orders/myorders
const getMyOrders = async (req, res) => {
  try {
    const userId = req.user ? req.user._id : req.query.userId;
    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get order by ID directly from MongoDB
// @route GET /api/orders/:id
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Update order status in MongoDB
// @route PUT /api/orders/:id/status
const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;
    const order = await Order.findById(req.params.id);
    if (order) {
      order.orderStatus = orderStatus;
      await order.save();
      res.json({ message: `Order status updated to ${orderStatus}`, order });
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get all orders directly from MongoDB (Admin)
// @route GET /api/orders
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).populate('user', 'name email').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  getAllOrders,
};
