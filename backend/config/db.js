const mongoose = require('mongoose');
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
} = require('../scripts/liveSeedData');

const populateLiveData = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[Live DB] Populating live hardware catalog, users & project kits into MongoDB...');
      await User.insertMany(liveUsers);
      await Seller.insertMany(liveSellers);
      await Product.insertMany(liveProducts);
      await ProjectKit.insertMany(liveProjectKits);
      await Order.insertMany(liveOrders);
      console.log('[Live DB] Success: Live dataset ready in MongoDB database!');
    } else {
      console.log(`[Live DB] Database active with ${userCount} users & live records.`);
    }
  } catch (err) {
    console.error('[Live DB Seeding Warning]', err.message);
  }
};

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/projectkart';

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
