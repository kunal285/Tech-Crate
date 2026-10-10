const express = require('express');
const router = express.Router();
const { initiateCheckout } = require('../controllers/checkoutController');
const { protect } = require('../middleware/authMiddleware');
const idempotencyGuard = require('../middleware/idempotencyMiddleware');

router.post('/initiate', protect, idempotencyGuard, initiateCheckout);

module.exports = router;
