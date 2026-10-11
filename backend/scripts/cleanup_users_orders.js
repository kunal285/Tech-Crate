require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {}

const preservedEmails = [
  'admin@techcrate.com',
  'kunalgavit263@gmail.com',
  'kunalgavit@gmail.com',
];

async function cleanup() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB database.');

  const User = require('../models/User');
  const Order = require('../models/Order');
  const Cart = require('../models/Cart');
  const CheckoutSession = require('../models/CheckoutSession');
  const Wishlist = require('../models/Wishlist');
  const RefreshToken = require('../models/RefreshToken');
  const Seller = require('../models/Seller');
  const Payment = require('../models/Payment');

  // Find all users matching preserved criteria
  const preservedUsers = await User.find({
    $or: [
      { email: { $in: preservedEmails } },
      { role: 'admin' },
    ],
  });

  const preservedIds = preservedUsers.map((u) => u._id);
  console.log(`\nPreserved Users (${preservedUsers.length}):`);
  preservedUsers.forEach((u) => console.log(`  -> [${u.role}] ${u.email} (${u.name})`));

  // 1. Delete all other users
  const userDeleteResult = await User.deleteMany({
    _id: { $nin: preservedIds },
  });
  console.log(`\nDeleted Users: ${userDeleteResult.deletedCount}`);

  // 2. Delete non-preserved sellers
  const sellerDeleteResult = await Seller.deleteMany({
    email: { $nin: preservedEmails },
  });
  console.log(`Deleted Sellers: ${sellerDeleteResult.deletedCount}`);

  // 3. Delete all orders except those belonging to preserved users
  const orderDeleteResult = await Order.deleteMany({
    user: { $nin: preservedIds },
  });
  console.log(`Deleted Orders: ${orderDeleteResult.deletedCount}`);

  // 4. Clean up related collections for removed users
  const cartDeleteResult = await Cart.deleteMany({ user: { $nin: preservedIds } });
  const sessionDeleteResult = await CheckoutSession.deleteMany({ user: { $nin: preservedIds } });
  const wishlistDeleteResult = await Wishlist.deleteMany({ user: { $nin: preservedIds } });
  const tokenDeleteResult = await RefreshToken.deleteMany({ user: { $nin: preservedIds } });
  const paymentDeleteResult = await Payment.deleteMany({ user: { $nin: preservedIds } });

  console.log(`Cleaned up Carts: ${cartDeleteResult.deletedCount}`);
  console.log(`Cleaned up Checkout Sessions: ${sessionDeleteResult.deletedCount}`);
  console.log(`Cleaned up Wishlists: ${wishlistDeleteResult.deletedCount}`);
  console.log(`Cleaned up Refresh Tokens: ${tokenDeleteResult.deletedCount}`);
  console.log(`Cleaned up Payments: ${paymentDeleteResult.deletedCount}`);

  // Verification of final database state
  const remainingUsers = await User.find({}, 'name email role');
  const remainingOrders = await Order.find({}, 'order_id totalPrice isPaid');

  console.log('\n======================================================');
  console.log('CURRENT DATABASE STATE');
  console.log('======================================================');
  console.log(`Remaining Users (${remainingUsers.length}):`);
  remainingUsers.forEach((u) => console.log(`  * [${u.role}] ${u.email} (${u.name})`));
  console.log(`Remaining Orders: ${remainingOrders.length}`);
  console.log('======================================================\n');

  await mongoose.disconnect();
  process.exit(0);
}

cleanup().catch((err) => {
  console.error('Cleanup failed:', err);
  process.exit(1);
});
