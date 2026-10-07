const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  clearNotifications,
  registerDeviceToken,
  unregisterDeviceToken,
} = require('../controllers/notificationController');
const { optionalProtect } = require('../middleware/authMiddleware');

router.get('/', optionalProtect, getNotifications);
router.post('/mark-read', optionalProtect, markAsRead);
router.post('/clear', optionalProtect, clearNotifications);
router.post('/register-device', optionalProtect, registerDeviceToken);
router.post('/unregister-device', optionalProtect, unregisterDeviceToken);

module.exports = router;
