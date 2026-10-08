const mongoose = require('mongoose');
const dns = require('dns');

// Ensure MongoDB Atlas SRV records resolve reliably on Windows / custom DNS setups
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (dnsErr) {
  // Ignore in restricted environments
}
const User = require('../models/User');
const Product = require('../models/Product');
const ProjectKit = require('../models/ProjectKit');
const Order = require('../models/Order');
const Seller = require('../models/Seller');
const {
  liveUsers,
  liveSellers,
  liveProducts,
  liveProjectKits,
  liveOrders,
  liveCategories,
  liveCoupons,
  liveBanners,
} = require('../scripts/liveSeedData');

const Poster = require('../models/Poster');
const Coupon = require('../models/Coupon');
const Category = require('../models/Category');
const Cart = require('../models/Cart');
const Wishlist = require('../models/Wishlist');

const populateLiveData = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[Live DB] Initializing user authentication accounts with passwords...');
      await User.insertMany(liveUsers);
      if (liveSellers && liveSellers.length > 0) {
        await Seller.insertMany(liveSellers);
      }
      console.log('[Live DB] User accounts created successfully.');
    } else {
      console.log(`[Live DB] Database active with ${userCount} users.`);
    }

    const productCount = await Product.countDocuments();
    if (productCount === 0 && liveProducts.length > 0) {
      await Product.insertMany(liveProducts);
      console.log(`[Live DB] Seeded ${liveProducts.length} authentic hardware components.`);
    } else {
      console.log(`[Live DB] Catalog active with ${productCount} components.`);
    }

    const posterCount = await Poster.countDocuments();
    if (posterCount === 0 && liveBanners && liveBanners.length > 0) {
      await Poster.insertMany(liveBanners);
      console.log(`[Live DB] Seeded ${liveBanners.length} promotional posters.`);
    }

    const couponCount = await Coupon.countDocuments();
    if (couponCount === 0 && liveCoupons && liveCoupons.length > 0) {
      await Coupon.insertMany(liveCoupons);
      console.log(`[Live DB] Seeded ${liveCoupons.length} promotional coupons.`);
    }

    const categoryCount = await Category.countDocuments();
    if (categoryCount === 0 && liveCategories && liveCategories.length > 0) {
      const catsToInsert = liveCategories.map(({ _id, ...c }) => c);
      await Category.insertMany(catsToInsert);
      console.log(`[Live DB] Seeded ${catsToInsert.length} hardware categories.`);
    }
  } catch (err) {
    console.error('[Live DB Warning]', err.message);
  }
};

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/TechCrate';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`[MongoDB] Connected: ${conn.connection.host}`);
    await populateLiveData();
  } catch (error) {
    console.log(`[MongoDB] Local DB offline (${error.message}). Initializing In-Memory Live MongoDB Cluster...`);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const memUri = mongoServer.getUri();
      const conn = await mongoose.connect(memUri);
      console.log(`[In-Memory MongoDB] Connected: ${conn.connection.host}`);
      await populateLiveData();
    } catch (memErr) {
      console.error('[In-Memory MongoDB Fail]', memErr.message);
    }
  }
};

module.exports = connectDB;
