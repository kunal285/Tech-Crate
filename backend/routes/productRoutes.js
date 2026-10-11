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
const { validate } = require('../middleware/zodValidation');
const { createProductSchema, updateProductSchema } = require('../validators/schemas');

router.route('/')
  .get(getProducts)
  .post(protect, authorizeRoles('seller', 'admin'), validate(createProductSchema), createProduct);

router.get('/search', getProducts);

router
  .route('/:id')
  .get(getProductById)
  .put(protect, authorizeRoles('seller', 'admin'), validate(updateProductSchema), updateProduct)
  .delete(protect, authorizeRoles('seller', 'admin'), deleteProduct);

module.exports = router;
