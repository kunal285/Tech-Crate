const cron = require('node-cron');
const CheckoutSession = require('../models/CheckoutSession');
const Product = require('../models/Product');

// Run every 5 minutes
cron.schedule('*/5 * * * *', async () => {
  try {
    const now = new Date();
    // Find sessions that are Active but past their expiresAt
    const expiredSessions = await CheckoutSession.find({
      sessionStatus: 'Active',
      expiresAt: { $lt: now }
    });

    if (expiredSessions.length > 0) {
      console.log(`[Checkout Cleanup] Found ${expiredSessions.length} expired checkout sessions. Releasing inventory...`);

      for (const session of expiredSessions) {
        // Restore inventory
        if (session.reservedInventory && session.reservedInventory.length > 0) {
          for (const item of session.reservedInventory) {
            await Product.findByIdAndUpdate(
              item.productId,
              { $inc: { stock: item.quantity } }
            ).catch(() => {});
          }
        }
        
        session.sessionStatus = 'Expired';
        await session.save();
      }
      
      console.log(`[Checkout Cleanup] Successfully released inventory for ${expiredSessions.length} sessions.`);
    }
  } catch (error) {
    console.error('[Checkout Cleanup Error]', error);
  }
});

module.exports = cron;
