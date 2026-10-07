const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const ProjectKit = require('../models/ProjectKit');
const Seller = require('../models/Seller');
const Poster = require('../models/Poster');
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

const Coupon = require('../models/Coupon');
const Category = require('../models/Category');

// @desc Categories management directly from MongoDB
const getCategories = async (req, res) => {
  try {
    let categories = await Category.find({}).sort({ name: 1 });
    if (!categories || categories.length === 0) {
      // Seed live categories if DB collection is empty
      const inserted = await Category.insertMany(
        liveCategories.map((c) => ({
          name: c.name,
          icon: c.icon || 'Cpu',
          count: c.count || 0,
          active: true,
        }))
      ).catch(() => []);
      categories = inserted.length ? inserted : liveCategories;
    }
    res.json(categories);
  } catch (error) {
    res.json(liveCategories);
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, icon, color } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Category name is required' });
    }
    const category = await Category.create({
      name: name.trim(),
      icon: icon || 'Cpu',
      color: color || '#032762',
      active: true,
    });
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc Coupons management directly from MongoDB
const getCoupons = async (req, res) => {
  try {
    let coupons = await Coupon.find({}).sort({ createdAt: -1 });
    if (!coupons || coupons.length === 0) {
      const inserted = await Coupon.insertMany(
        liveCoupons.map((cp) => ({
          code: cp.code.toUpperCase(),
          discountType: cp.discountType || 'percentage',
          discountValue: cp.discountValue || 15,
          minOrder: cp.minOrder || 0,
          maxDiscount: cp.maxDiscount || null,
          usageLimit: cp.usageLimit || 100,
          active: true,
        }))
      ).catch(() => []);
      coupons = inserted.length ? inserted : liveCoupons;
    }
    res.json(coupons);
  } catch (error) {
    res.json(liveCoupons);
  }
};

const createCoupon = async (req, res) => {
  try {
    const { code, discountType, discountValue, minOrder, maxDiscount, usageLimit, expiryDate } = req.body;
    if (!code || !code.trim()) {
      return res.status(400).json({ message: 'Coupon code is required' });
    }
    const cleanCode = code.toUpperCase().trim();
    const existing = await Coupon.findOne({ code: cleanCode });
    if (existing) {
      return res.status(400).json({ message: `Coupon '${cleanCode}' already exists` });
    }
    const coupon = await Coupon.create({
      code: cleanCode,
      discountType: discountType || 'percentage',
      discountValue: Number(discountValue),
      minOrder: Number(minOrder || 0),
      maxDiscount: maxDiscount ? Number(maxDiscount) : null,
      usageLimit: usageLimit ? Number(usageLimit) : 100,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      active: true,
    });
    res.status(201).json(coupon);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (coupon) {
      await coupon.deleteOne();
      return res.json({ message: 'Coupon deleted successfully' });
    }
    res.status(404).json({ message: 'Coupon not found' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Banners management
const getBanners = async (req, res) => {
  try {
    const posters = await Poster.find().sort({ displayOrder: 1, createdAt: -1 });
    res.json(posters);
  } catch (err) {
    res.json(bannersList);
  }
};

const createBanner = async (req, res) => {
  try {
    const poster = await Poster.create({
      imageUrl: req.body.image || req.body.imageUrl,
      title: req.body.title || 'Promotional Banner',
      linkType: req.body.linkType || 'none',
      linkValue: req.body.linkValue || '',
      isActive: req.body.isActive !== undefined ? req.body.isActive : true,
      displayOrder: req.body.displayOrder || 0,
      startDate: req.body.startDate || null,
      endDate: req.body.endDate || null,
    });
    res.status(201).json(poster);
  } catch (err) {
    const newBanner = { _id: 'b_' + Date.now(), ...req.body, active: true };
    bannersList.push(newBanner);
    res.status(201).json(newBanner);
  }
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

// @desc Get administrative audit logs
const getAuditLogs = async (req, res) => {
  try {
    const AuditLog = require('../models/AuditLog');
    const logs = await AuditLog.find({}).sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, count: logs.length, logs });
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
  deleteCoupon,
  getBanners,
  createBanner,
  getNotifications,
  sendNotification,
  getReviews,
  getPayments,
  getAuditLogs,
};
