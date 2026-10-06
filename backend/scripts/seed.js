const mongoose = require('mongoose');
const dotenv = require('dotenv');
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
} = require('./liveSeedData');

dotenv.config();

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/projectkart';
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 });
    console.log('[Seed] Database connected successfully to', uri);
  } catch (error) {
    console.log('[Seed] Local Mongo down. Starting In-Memory MongoDB for seeding test...');
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    console.log('[Seed] In-Memory MongoDB connected.');
  }
};

const seedData = async () => {
  await connectDB();

  try {
    await User.deleteMany();
    await Product.deleteMany();
    await ProjectKit.deleteMany();
    await Order.deleteMany();
    await Seller.deleteMany();

    console.log('[Seed] Cleared existing collection data.');

    await User.insertMany(liveUsers);
    console.log(`[Seed] Inserted ${liveUsers.length} live users.`);

    await Seller.insertMany(liveSellers);
    console.log(`[Seed] Inserted ${liveSellers.length} verified sellers.`);

    await Product.insertMany(liveProducts);
    console.log(`[Seed] Inserted ${liveProducts.length} authentic hardware products.`);

    await ProjectKit.insertMany(liveProjectKits);
    console.log(`[Seed] Inserted ${liveProjectKits.length} DIY engineering project kits.`);

    await Order.insertMany(liveOrders);
    console.log(`[Seed] Inserted ${liveOrders.length} live customer orders.`);

    console.log('[Seed Success] All live hardware & project records inserted successfully!');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Fatal Error]', error);
    process.exit(1);
  }
};

seedData();
