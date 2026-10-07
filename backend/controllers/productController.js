const Product = require('../models/Product');

// @desc Fetch all products with search, category filtering & pagination
// @route GET /api/products
const getProducts = async (req, res) => {
  try {
    const { keyword, category, page, limit } = req.query;
    let query = {};

    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
        { sku: { $regex: keyword, $options: 'i' } },
      ];
    }

    if (category && category !== 'All' && category !== 'all') {
      query.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }

    // Optional pagination
    if (page || limit) {
      const pageNum = Math.max(1, Number(page) || 1);
      const pageSize = Math.min(100, Math.max(1, Number(limit) || 20));
      const total = await Product.countDocuments(query);
      const products = await Product.find(query)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * pageSize)
        .limit(pageSize);

      return res.json({
        products,
        page: pageNum,
        pages: Math.ceil(total / pageSize),
        total,
      });
    }

    const products = await Product.find(query).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Fetch single product by ID directly from MongoDB
// @route GET /api/products/:id
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const parseFeatures = (features) => {
  if (Array.isArray(features)) {
    return features.map((f) => String(f).trim()).filter(Boolean);
  }
  if (typeof features === 'string') {
    return features
      .split(/[\r\n,]+/)
      .map((f) => f.trim())
      .filter(Boolean);
  }
  return [];
};

const parseImages = (images) => {
  if (Array.isArray(images)) {
    return images.map((img) => String(img).trim()).filter(Boolean).slice(0, 4);
  }
  if (typeof images === 'string' && images.trim()) {
    return [images.trim()];
  }
  return [];
};

// @desc Create a new product in MongoDB (Admin / Seller)
// @route POST /api/products
const createProduct = async (req, res) => {
  try {
    const data = { ...req.body };

    if (!data.title || !data.title.trim()) {
      return res.status(400).json({ message: 'Product title is required' });
    }

    if (data.stock !== undefined && Number(data.stock) < 0) {
      return res.status(400).json({ message: 'Stock quantity cannot be negative' });
    }

    if (data.features !== undefined) {
      data.features = parseFeatures(data.features);
    }
    if (data.images !== undefined) {
      data.images = parseImages(data.images);
    }

    const origPrice = Number(data.originalPrice) || Number(data.price) || 0;
    const discPrice = Number(data.discountedPrice) || Number(data.price) || origPrice;

    data.originalPrice = origPrice;
    data.discountedPrice = discPrice;
    data.price = discPrice;
    if (origPrice > discPrice && origPrice > 0) {
      data.discountPercentage = Math.round(((origPrice - discPrice) / origPrice) * 100);
    }

    // Assign seller if created by seller role
    if (req.user && req.user.role === 'seller') {
      data.seller = req.user._id;
    }

    const product = new Product({
      ...data,
      stock: Math.max(0, Number(data.stock) || 0),
      rating: data.rating || 4.5,
      reviewCount: data.reviewCount || 0,
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc Update product in MongoDB (Admin / Authorized Seller)
// @route PUT /api/products/:id
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Authorization check: If user is seller, verify ownership
    if (req.user.role === 'seller' && product.seller) {
      if (product.seller.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Forbidden: You can only edit your own products' });
      }
    }

    const data = { ...req.body };

    if (data.stock !== undefined && Number(data.stock) < 0) {
      return res.status(400).json({ message: 'Stock quantity cannot be negative' });
    }

    if (data.features !== undefined) {
      data.features = parseFeatures(data.features);
    }
    if (data.images !== undefined) {
      data.images = parseImages(data.images);
    }

    if (data.originalPrice !== undefined || data.discountedPrice !== undefined || data.price !== undefined) {
      const origPrice =
        data.originalPrice !== undefined ? Number(data.originalPrice) : (product.originalPrice || product.price);
      const discPrice =
        data.discountedPrice !== undefined
          ? Number(data.discountedPrice)
          : (data.price !== undefined ? Number(data.price) : product.price);

      data.originalPrice = origPrice;
      data.discountedPrice = discPrice;
      data.price = discPrice;
      if (origPrice > discPrice && origPrice > 0) {
        data.discountPercentage = Math.round(((origPrice - discPrice) / origPrice) * 100);
      }
    }

    if (data.stock !== undefined) {
      data.stock = Math.max(0, Number(data.stock));
    }

    Object.assign(product, data);
    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc Delete product from MongoDB (Admin / Authorized Seller)
// @route DELETE /api/products/:id
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Authorization check for seller
    if (req.user.role === 'seller' && product.seller) {
      if (product.seller.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Forbidden: You can only delete your own products' });
      }
    }

    await product.deleteOne();
    res.json({ success: true, message: 'Product removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
