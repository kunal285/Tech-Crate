const Notification = require('../models/Notification');
const DeviceToken = require('../models/DeviceToken');

/**
 * @desc Get user and broadcast notifications
 * @route GET /api/notifications
 * @access Public / Optional Protect
 */
const getNotifications = async (req, res) => {
  try {
    const userId = req.user?._id;
    const userRole = req.user?.role || 'customer';

    const targetConditions = [{ target: 'all' }];
    if (userRole === 'customer' || userRole === 'student') {
      targetConditions.push({ target: 'customers' });
    }
    if (userRole === 'seller') {
      targetConditions.push({ target: 'sellers' });
    }
    if (userRole === 'student') {
      targetConditions.push({ target: 'students' });
    }

    const query = {
      $or: targetConditions,
    };

    if (userId) {
      query.$or.push({ recipient: userId });
      query.clearedBy = { $ne: userId };
    }

    const rawNotifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const formatted = rawNotifications.map((notif) => {
      const isRead = userId ? (notif.readBy || []).some((id) => String(id) === String(userId)) : false;
      return {
        _id: notif._id,
        id: notif._id,
        title: notif.title,
        body: notif.body,
        type: notif.type || 'broadcast',
        target: notif.target || 'all',
        data: notif.data || {},
        read: isRead,
        createdAt: notif.createdAt,
      };
    });

    res.json({
      success: true,
      notifications: formatted,
      unreadCount: formatted.filter((n) => !n.read).length,
    });
  } catch (error) {
    console.error('[NotificationController] Error fetching notifications:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve notifications', notifications: [] });
  }
};

/**
 * @desc Mark notification as read
 * @route POST /api/notifications/mark-read
 * @access Optional Protect
 */
const markAsRead = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { notificationId, all } = req.body;

    if (!userId) {
      return res.json({ success: true, message: 'Read status acknowledged' });
    }

    if (all) {
      await Notification.updateMany(
        { readBy: { $ne: userId } },
        { $addToSet: { readBy: userId } }
      );
    } else if (notificationId) {
      await Notification.findByIdAndUpdate(notificationId, {
        $addToSet: { readBy: userId },
      });
    }

    res.json({ success: true, message: 'Notifications updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Clear / delete notification
 * @route POST /api/notifications/clear
 * @access Optional Protect
 */
const clearNotifications = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { notificationId, all } = req.body;

    if (userId) {
      if (all) {
        await Notification.updateMany({}, { $addToSet: { clearedBy: userId } });
      } else if (notificationId) {
        await Notification.findByIdAndUpdate(notificationId, {
          $addToSet: { clearedBy: userId },
        });
      }
    }

    res.json({ success: true, message: 'Notification cleared' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Register or update FCM device token
 * @route POST /api/notifications/register-device
 * @access Optional Protect
 */
const registerDeviceToken = async (req, res) => {
  try {
    const { deviceToken, platform } = req.body;
    if (!deviceToken || typeof deviceToken !== 'string') {
      return res.status(400).json({ success: false, message: 'deviceToken is required' });
    }

    const userId = req.user?._id || null;

    await DeviceToken.findOneAndUpdate(
      { token: deviceToken.trim() },
      {
        token: deviceToken.trim(),
        user: userId,
        platform: ['android', 'ios', 'web'].includes(platform) ? platform : 'android',
        lastActiveAt: new Date(),
      },
      { upsert: true, new: true }
    );

    res.json({ success: true, message: 'Device token registered successfully' });
  } catch (error) {
    console.error('[NotificationController] Error registering device token:', error);
    res.status(500).json({ success: false, message: 'Failed to register device token' });
  }
};

/**
 * @desc Unregister device token
 * @route POST /api/notifications/unregister-device
 * @access Optional Protect
 */
const unregisterDeviceToken = async (req, res) => {
  try {
    const { deviceToken } = req.body;
    if (deviceToken) {
      await DeviceToken.deleteOne({ token: String(deviceToken).trim() });
    }
    res.json({ success: true, message: 'Device token unregistered' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  clearNotifications,
  registerDeviceToken,
  unregisterDeviceToken,
};
