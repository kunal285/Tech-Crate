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

async function deleteCustomerOrdersFromDb(dbName) {
  const uri = process.env.MONGO_URI.replace('/TechCrate', '/' + dbName);
  const conn = await mongoose.createConnection(uri).asPromise();
  console.log(`\n======================================================`);
  console.log(`Connected to Database: ${dbName}`);
  console.log(`======================================================`);

  const usersColl = conn.db.collection('users');
  const ordersColl = conn.db.collection('orders');
  const paymentsColl = conn.db.collection('payments');
  const sessionsColl = conn.db.collection('checkoutsessions');
  const cartsColl = conn.db.collection('carts');

  // Find preserved user IDs
  const preservedUsers = await usersColl.find({
    $or: [
      { email: { $in: preservedEmails } },
      { role: 'admin' },
    ],
  }).toArray();

  const preservedIds = preservedUsers.map((u) => u._id);
  console.log(`Preserved Users (${preservedUsers.length}):`);
  preservedUsers.forEach((u) => console.log(`  -> [${u.role || 'user'}] ${u.email} (ID: ${u._id})`));

  // Count orders belonging to preserved users
  const preservedOrdersCount = await ordersColl.countDocuments({
    user: { $in: preservedIds },
  });
  console.log(`Preserved User Orders: ${preservedOrdersCount}`);

  // Delete all orders NOT belonging to preserved users (all customer orders)
  const orderDeleteResult = await ordersColl.deleteMany({
    user: { $nin: preservedIds },
  });
  console.log(`Deleted Customer Orders: ${orderDeleteResult.deletedCount}`);

  // Delete related payments, sessions, and carts
  const paymentDeleteResult = await paymentsColl.deleteMany({
    user: { $nin: preservedIds },
  });
  console.log(`Cleaned up customer payments: ${paymentDeleteResult.deletedCount}`);

  const sessionDeleteResult = await sessionsColl.deleteMany({
    user: { $nin: preservedIds },
  });
  console.log(`Cleaned up customer checkout sessions: ${sessionDeleteResult.deletedCount}`);

  const cartDeleteResult = await cartsColl.deleteMany({
    user: { $nin: preservedIds },
  });
  console.log(`Cleaned up customer carts: ${cartDeleteResult.deletedCount}`);

  const remainingOrders = await ordersColl.countDocuments({});
  console.log(`Total Remaining Orders in ${dbName}: ${remainingOrders}`);

  await conn.close();
}

async function main() {
  // Run on both 'test' (used by Render remote production) and 'TechCrate' (used locally)
  await deleteCustomerOrdersFromDb('test');
  await deleteCustomerOrdersFromDb('TechCrate');
  console.log('\nAll customer orders successfully deleted across databases.');
  process.exit(0);
}

main().catch((err) => {
  console.error('Failed to delete customer orders:', err);
  process.exit(1);
});
