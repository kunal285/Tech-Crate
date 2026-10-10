const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  updateOrderStatus,
  getAllOrders,
} = require('../controllers/orderController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const { checkoutLimiter } = require('../middleware/rateLimiter');
const { validate } = require('../middleware/zodValidation');
const { createOrderSchema, updateOrderStatusSchema } = require('../validators/schemas');
const idempotencyGuard = require('../middleware/idempotencyMiddleware');

router.route('/')
  .post(protect, checkoutLimiter, idempotencyGuard, validate(createOrderSchema), createOrder)
  .get(protect, authorizeRoles('admin'), getAllOrders);

router.get('/myorders', protect, getMyOrders);
router.get('/my-orders', protect, getMyOrders); // mobile & web alias

router.route('/:id').get(protect, getOrderById);
router.put('/:id/cancel', protect, cancelOrder);
router.put('/:id/status', protect, authorizeRoles('seller', 'admin'), validate(updateOrderStatusSchema), updateOrderStatus);

module.exports = router;
