const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/adminController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorizeRoles('admin'));

// Stats & Dashboard
router.get('/stats', getAdminStats);

// Users
router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

// Sellers
router.get('/sellers', getSellers);
router.put('/sellers/:id/approve', approveSeller);
router.put('/sellers/:id/reject', rejectSeller);

// Categories
router.route('/categories').get(getCategories).post(createCategory);

// Coupons
router.route('/coupons').get(getCoupons).post(createCoupon);

// Banners
router.route('/banners').get(getBanners).post(createBanner);

// Notifications
router.route('/notifications').get(getNotifications).post(sendNotification);

// Reviews & Payments
router.get('/reviews', getReviews);
router.get('/payments', getPayments);

module.exports = router;
