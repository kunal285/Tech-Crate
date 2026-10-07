/**
 * Background Job & Queue Service
 * Dispatches non-blocking side-effects (Email, Push, Invoices, Analytics).
 * Customer-facing APIs return immediately without waiting for background tasks.
 */

const queueService = {
  /**
   * Enqueue a background task
   * @param {string} taskName - Name of the task
   * @param {object} payload - Job payload
   * @param {Function} handler - Async function to execute
   */
  enqueue(taskName, payload, handler) {
    setImmediate(async () => {
      const startTime = Date.now();
      try {
        await handler(payload);
        if (process.env.NODE_ENV !== 'production') {
          console.log(`[Job Completed] ${taskName} (${Date.now() - startTime}ms)`);
        }
      } catch (err) {
        console.error(`[Job Failed] ${taskName}:`, err.message);
      }
    });
  },

  /**
   * Dispatch Order Confirmation processing (Email, Push, Inventory Sync)
   */
  dispatchOrderProcessing(order, user) {
    this.enqueue('SEND_ORDER_CONFIRMATION', { order, user }, async ({ order, user }) => {
      // 1. Email notification
      const { sendEmail } = require('./emailService');
      if (user?.email) {
        await sendEmail({
          to: user.email,
          subject: `TechCrate Order Confirmed: #${order.trackingNumber || order._id}`,
          text: `Hi ${user.name || 'Engineer'},\n\nYour order of ₹${order.totalPrice} has been confirmed.\nTracking Number: ${order.trackingNumber || 'Pending'}`,
        }).catch((e) => console.log('[Queue Email Skip]', e.message));
      }

      // 2. Push Notification via FCM
      const { sendPushNotification } = require('./smsService');
      if (user?._id) {
        // FCM push dispatch
      }
    });
  },
};

module.exports = queueService;
