const express = require('express');
const router = express.Router();
const { initiateCheckout } = require('../controllers/checkoutController');
const { protect } = require('../middleware/authMiddleware');

router.post('/initiate', protect, initiateCheckout);

module.exports = router;
