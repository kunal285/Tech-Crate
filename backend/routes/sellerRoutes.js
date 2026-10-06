const express = require('express');
const router = express.Router();
const { registerSellerStore, getSellerDashboard } = require('../controllers/sellerController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.post('/register', protect, registerSellerStore);
router.get('/dashboard', protect, authorizeRoles('seller', 'admin'), getSellerDashboard);

module.exports = router;
