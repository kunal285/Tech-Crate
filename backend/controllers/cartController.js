const Cart = require('../models/Cart');

// @desc Get user cart
// @route GET /api/cart
const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product')
      .populate('items.projectKit');

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Add item to cart
// @route POST /api/cart
const addToCart = async (req, res) => {
  try {
    const { productId, projectKitId, itemType, quantity, price } = req.body;
    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    const existingIndex = cart.items.findIndex((item) => {
      if (itemType === 'kit' && item.projectKit) {
        return item.projectKit.toString() === projectKitId;
      }
      if (itemType === 'product' && item.product) {
        return item.product.toString() === productId;
      }
      return false;
    });

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += Number(quantity || 1);
    } else {
      cart.items.push({
        product: productId || null,
        projectKit: projectKitId || null,
        itemType: itemType || 'product',
        quantity: Number(quantity || 1),
        price: Number(price),
      });
    }

    await cart.save();
    const updatedCart = await Cart.findOne({ user: req.user._id })
      .populate('items.product')
      .populate('items.projectKit');

    res.json(updatedCart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Update item quantity
// @route PUT /api/cart/item
const updateCartItem = async (req, res) => {
  try {
    const { itemId, quantity } = req.body;
    let cart = await Cart.findOne({ user: req.user._id });

    if (cart) {
      const itemIndex = cart.items.findIndex((i) => i._id.toString() === itemId);
      if (itemIndex > -1) {
        if (quantity <= 0) {
          cart.items.splice(itemIndex, 1);
        } else {
          cart.items[itemIndex].quantity = quantity;
        }
        await cart.save();
      }
    }
    const updatedCart = await Cart.findOne({ user: req.user._id })
      .populate('items.product')
      .populate('items.projectKit');
    res.json(updatedCart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Clear cart
// @route DELETE /api/cart
const clearCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    res.json({ message: 'Cart cleared' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getCart, addToCart, updateCartItem, clearCart };
