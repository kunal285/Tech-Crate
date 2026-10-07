const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/zodValidation');
const { addToCartSchema } = require('../validators/schemas');

router.use(protect);

router.route('/')
  .get(getCart)
  .post(validate(addToCartSchema), addToCart)
  .delete(clearCart);

// Client alias endpoints
router.post('/add', validate(addToCartSchema), addToCart);
router.put('/item', updateCartItem);
router.put('/item/:itemId', updateCartItem);
router.put('/items/:itemId', updateCartItem);
router.delete('/item/:itemId', removeCartItem);
router.delete('/items/:itemId', removeCartItem);
router.delete('/clear', clearCart);

module.exports = router;
