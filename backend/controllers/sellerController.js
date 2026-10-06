const Seller = require('../models/Seller');
const Product = require('../models/Product');
const Order = require('../models/Order');

const registerSellerStore = async (req, res) => {
  try {
    const { storeName, storeDescription, gstNumber } = req.body;
    let seller = await Seller.findOne({ user: req.user._id });

    if (!seller) {
      seller = await Seller.create({
        user: req.user._id,
        storeName: storeName || '',
        storeDescription: storeDescription || '',
        gstNumber: gstNumber || '',
        isApproved: false,
      });
    }
    res.status(201).json(seller);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSellerDashboard = async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user._id });
    const sellerProductIds = products.map((p) => p._id);
    const orders = await Order.find({ 'orderItems.product': { $in: sellerProductIds } });

    let totalRevenue = 0;
    let totalItemsSold = 0;

    orders.forEach((order) => {
      if (order.isPaid) {
        order.orderItems.forEach((item) => {
          if (sellerProductIds.some((id) => id.equals(item.product))) {
            totalRevenue += (item.price || 0) * (item.quantity || 1);
            totalItemsSold += item.quantity || 1;
          }
        });
      }
    });

    res.json({
      totalProducts: products.length,
      totalOrders: orders.length,
      totalRevenue,
      totalItemsSold,
      recentProducts: products.slice(0, 5),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerSellerStore, getSellerDashboard };
