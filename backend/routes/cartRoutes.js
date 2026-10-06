const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItem,
  clearCart,
} = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

router
  .route('/')
  .get(protect, getCart)
  .post(protect, addToCart)
  .delete(protect, clearCart);

router.put('/item', protect, updateCartItem);

module.exports = router;
