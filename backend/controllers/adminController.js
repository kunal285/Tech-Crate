const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const ProjectKit = require('../models/ProjectKit');
const Seller = require('../models/Seller');
const {
  liveCategories,
  liveCoupons,
  liveBanners,
} = require('../scripts/liveSeedData');

// In-Memory store initialized for admin management
let categoriesList = [...liveCategories];
let couponsList = [...liveCoupons];
let bannersList = [...liveBanners];
let notificationsList = [];

// @desc Get platform system analytics & stats directly from MongoDB
// @route GET /api/admin/stats
const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalProjects = await ProjectKit.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalSellers = await Seller.countDocuments();

    const paidOrders = await Order.find({ isPaid: true });
    const totalRevenue = paidOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);

    const pendingOrders = await Order.countDocuments({ orderStatus: { $in: ['Pending', 'Processing'] } });
    const pendingSellerApprovals = await Seller.countDocuments({ isApproved: false });

    // Category Sales Breakdown from real DB
    const categoryStats = await Product.aggregate([
      { $group: { _id: '$category', totalStock: { $sum: '$stock' }, count: { $sum: 1 } } },
    ]);

    const categoryBreakdown = categoryStats.map((c) => ({
      name: c._id || 'General',
      sales: c.count,
    }));

    res.json({
      totalUsers,
      totalProducts,
      totalProjects,
      totalOrders,
      totalSellers,
      totalRevenue,
      pendingOrders,
      pendingSellerApprovals,
      pendingProductApprovals: 0,
      monthlySales: [
        { month: 'Current', revenue: totalRevenue, orders: totalOrders },
      ],
      categoryBreakdown,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get all registered users directly from MongoDB
// @route GET /api/admin/users
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get user by ID directly from MongoDB
// @route GET /api/admin/users/:id
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Update user role in MongoDB (Admin)
// @route PUT /api/admin/users/:id/role
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findById(req.params.id);
    if (user) {
      user.role = role;
      await user.save();
      res.json({ message: `User role updated to ${role}`, user });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Delete user from MongoDB
// @route DELETE /api/admin/users/:id
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      await user.deleteOne();
      res.json({ message: 'User deleted successfully' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get sellers directly from MongoDB
// @route GET /api/admin/sellers
const getSellers = async (req, res) => {
  try {
    const sellers = await Seller.find({}).populate('user', 'name email college branch');
    res.json(sellers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Approve seller in MongoDB
// @route PUT /api/admin/sellers/:id/approve
const approveSeller = async (req, res) => {
  try {
    const seller = await Seller.findById(req.params.id);
    if (seller) {
      seller.isApproved = true;
      await seller.save();
      res.json({ message: 'Seller application approved successfully!', seller });
    } else {
      res.status(404).json({ message: 'Seller not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Reject seller in MongoDB
// @route PUT /api/admin/sellers/:id/reject
const rejectSeller = async (req, res) => {
  try {
    const seller = await Seller.findById(req.params.id);
    if (seller) {
      seller.isApproved = false;
      await seller.save();
      res.json({ message: 'Seller application rejected', seller });
    } else {
      res.status(404).json({ message: 'Seller not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Categories management
const getCategories = async (req, res) => {
  res.json(categoriesList);
};

const createCategory = async (req, res) => {
  const newCat = { _id: 'cat_' + Date.now(), name: req.body.name, icon: 'Cpu', count: 0, active: true };
  categoriesList.push(newCat);
  res.status(201).json(newCat);
};

// @desc Coupons management
const getCoupons = async (req, res) => {
  res.json(couponsList);
};

const createCoupon = async (req, res) => {
  const newCoupon = { _id: 'cp_' + Date.now(), ...req.body, active: true, usageCount: 0 };
  couponsList.push(newCoupon);
  res.status(201).json(newCoupon);
};

// @desc Banners management
const getBanners = async (req, res) => {
  res.json(bannersList);
};

const createBanner = async (req, res) => {
  const newBanner = { _id: 'b_' + Date.now(), ...req.body, active: true };
  bannersList.push(newBanner);
  res.status(201).json(newBanner);
};

// @desc Notifications management
const getNotifications = async (req, res) => {
  res.json(notificationsList);
};

const sendNotification = async (req, res) => {
  const newNotif = { _id: 'n_' + Date.now(), ...req.body, createdAt: new Date() };
  notificationsList.unshift(newNotif);
  res.status(201).json({ message: 'Notification broadcasted via FCM!', notification: newNotif });
};

// @desc Reviews management
const getReviews = async (req, res) => {
  try {
    const products = await Product.find({ 'reviews.0': { $exists: true } });
    const reviewsList = [];
    products.forEach((prod) => {
      if (prod.reviews && Array.isArray(prod.reviews)) {
        prod.reviews.forEach((rev) => {
          reviewsList.push({
            _id: rev._id || 'rev_' + Date.now(),
            customerName: rev.name || 'Anonymous',
            productName: prod.title || prod.name,
            rating: rev.rating || 5,
            comment: rev.comment || '',
            date: rev.createdAt ? new Date(rev.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          });
        });
      }
    });
    res.json(reviewsList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Payments management
const getPayments = async (req, res) => {
  try {
    const orders = await Order.find({}).populate('user', 'name').sort({ createdAt: -1 });
    const payments = orders.map((order) => ({
      _id: 'pay_' + order._id,
      orderId: order.trackingNumber || order._id,
      customerName: order.user ? order.user.name : 'Customer',
      amount: order.totalPrice || 0,
      paymentMethod: order.paymentMethod || 'UPI',
      status: order.isPaid ? 'Successful' : 'Pending',
      date: order.createdAt ? new Date(order.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    }));
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAdminStats,
  getUsers,
  getUserById,
  updateUserRole,
  deleteUser,
  getSellers,
  approveSeller,
  rejectSeller,
  getCategories,
  createCategory,
  getCoupons,
  createCoupon,
  getBanners,
  createBanner,
  getNotifications,
  sendNotification,
  getReviews,
  getPayments,
};
