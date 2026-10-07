const Cart = require('../models/Cart');
const Product = require('../models/Product');
const ProjectKit = require('../models/ProjectKit');

/**
 * Server-side calculation helper for cart totals
 */
const calculateCartTotals = (items) => {
  const subtotal = items.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);
  const shippingPrice = subtotal >= 999 || subtotal === 0 ? 0 : 70;
  const taxPrice = Math.round(subtotal * 0.18); // 18% GST standard hardware component tax
  const totalPrice = subtotal + shippingPrice + taxPrice;

  return { subtotal, shippingPrice, taxPrice, totalPrice };
};

// @desc Get user cart with server-side totals
// @route GET /api/cart
const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product')
      .populate('items.projectKit');

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    const { subtotal, shippingPrice, taxPrice, totalPrice } = calculateCartTotals(cart.items);

    res.json({
      ...cart.toObject(),
      subtotal,
      shippingPrice,
      taxPrice,
      totalPrice,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Add item to cart with secure server-side price lookup & stock check
// @route POST /api/cart or POST /api/cart/add
const addToCart = async (req, res) => {
  try {
    const { productId, projectKitId, itemType = 'product', quantity = 1 } = req.body;
    const qty = Math.max(1, Number(quantity) || 1);

    let actualPrice = 0;
    let availableStock = 0;
    let resolvedItemType = itemType;
    let productRef = null;
    let kitRef = null;

    if (projectKitId || itemType === 'kit') {
      const kit = await ProjectKit.findById(projectKitId || productId);
      if (!kit) {
        return res.status(404).json({ message: 'Project kit not found' });
      }
      actualPrice = kit.price;
      availableStock = 50; // Kits inventory
      resolvedItemType = 'kit';
      kitRef = kit._id;
    } else {
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: 'Component product not found' });
      }
      actualPrice = product.price;
      availableStock = product.stock || 0;
      resolvedItemType = 'product';
      productRef = product._id;
    }

    if (availableStock < qty) {
      return res.status(400).json({
        message: `Only ${availableStock} units available in stock.`,
      });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    const existingIndex = cart.items.findIndex((item) => {
      if (resolvedItemType === 'kit' && item.projectKit) {
        return item.projectKit.toString() === kitRef.toString();
      }
      if (resolvedItemType === 'product' && item.product) {
        return item.product.toString() === productRef.toString();
      }
      return false;
    });

    if (existingIndex > -1) {
      const newTotalQty = cart.items[existingIndex].quantity + qty;
      if (availableStock < newTotalQty) {
        return res.status(400).json({
          message: `Cannot add more. You have ${cart.items[existingIndex].quantity} in cart, and only ${availableStock} in stock.`,
        });
      }
      cart.items[existingIndex].quantity = newTotalQty;
      // Refresh genuine price
      cart.items[existingIndex].price = actualPrice;
    } else {
      cart.items.push({
        product: productRef,
        projectKit: kitRef,
        itemType: resolvedItemType,
        quantity: qty,
        price: actualPrice, // Server-enforced price
      });
    }

    await cart.save();

    const updatedCart = await Cart.findOne({ user: req.user._id })
      .populate('items.product')
      .populate('items.projectKit');

    const { subtotal, shippingPrice, taxPrice, totalPrice } = calculateCartTotals(updatedCart.items);

    res.json({
      ...updatedCart.toObject(),
      subtotal,
      shippingPrice,
      taxPrice,
      totalPrice,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Update item quantity in cart with stock validation
// @route PUT /api/cart/item or PUT /api/cart/items/:itemId
const updateCartItem = async (req, res) => {
  try {
    const itemId = req.params.itemId || req.body.itemId;
    const quantity = Number(req.body.quantity);

    if (!itemId) {
      return res.status(400).json({ message: 'Cart item ID is required' });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(
      (i) => i._id.toString() === itemId || i.product?.toString() === itemId
    );

    if (itemIndex > -1) {
      if (quantity <= 0) {
        cart.items.splice(itemIndex, 1);
      } else {
        // Verify stock against product
        const cartItem = cart.items[itemIndex];
        if (cartItem.product) {
          const product = await Product.findById(cartItem.product);
          if (product && product.stock < quantity) {
            return res.status(400).json({
              message: `Requested ${quantity} exceeds available stock of ${product.stock}`,
            });
          }
          if (product) cartItem.price = product.price; // Re-sync price
        }
        cartItem.quantity = quantity;
      }
      await cart.save();
    }

    const updatedCart = await Cart.findOne({ user: req.user._id })
      .populate('items.product')
      .populate('items.projectKit');

    const { subtotal, shippingPrice, taxPrice, totalPrice } = calculateCartTotals(updatedCart.items);

    res.json({
      ...updatedCart.toObject(),
      subtotal,
      shippingPrice,
      taxPrice,
      totalPrice,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Remove single item from cart
// @route DELETE /api/cart/items/:itemId
const removeCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    let cart = await Cart.findOne({ user: req.user._id });

    if (cart) {
      cart.items = cart.items.filter(
        (i) => i._id.toString() !== itemId && i.product?.toString() !== itemId
      );
      await cart.save();
    }

    const updatedCart = await Cart.findOne({ user: req.user._id })
      .populate('items.product')
      .populate('items.projectKit');

    const { subtotal, shippingPrice, taxPrice, totalPrice } = calculateCartTotals(updatedCart.items);

    res.json({
      ...updatedCart.toObject(),
      subtotal,
      shippingPrice,
      taxPrice,
      totalPrice,
    });
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
    res.json({ message: 'Cart cleared successfully', items: [] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
};
