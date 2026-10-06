const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.route('/').get(getProducts).post(protect, authorizeRoles('seller', 'admin'), createProduct);
router
  .route('/:id')
  .get(getProductById)
  .put(protect, authorizeRoles('seller', 'admin'), updateProduct)
  .delete(protect, authorizeRoles('seller', 'admin'), deleteProduct);

module.exports = router;
