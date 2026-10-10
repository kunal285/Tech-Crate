const express = require('express');
const router = express.Router();

// 1. Mobile App Version Policy & Forced Update Endpoint
router.get('/app-version', (req, res) => {
  const versionData = {
    currentVersion: '1.0.0',
    minSupportedVersion: '0.1.0',
    forceUpdate: false,
    updateTitle: 'New Version Available',
    updateMessage: 'A new version of TechCrate is available with enhanced checkout stability and speed.',
    androidPackage: 'com.techcrate.app',
    iosAppId: '1234567890',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.techcrate.app',
    releaseDate: '2026-10-11',
  };

  if (typeof res.success === 'function') {
    return res.success(versionData, { cached: false });
  }
  return res.json({ success: true, data: versionData });
});

// 2. Core V1 Sub-Routers
router.use('/auth', require('./authRoutes'));
router.use('/products', require('./productRoutes'));
router.use('/projects', require('./projectRoutes'));
router.use('/cart', require('./cartRoutes'));
router.use('/checkout', require('./checkoutRoutes'));
router.use('/orders', require('./orderRoutes'));
router.use('/admin', require('./adminRoutes'));
router.use('/seller', require('./sellerRoutes'));
router.use('/ai', require('./aiRoutes'));
router.use('/upload', require('./uploadRoutes'));
router.use('/posters', require('./posterRoutes'));
router.use('/banners', require('./posterRoutes'));
router.use('/notifications', require('./notificationRoutes'));
router.use(['/payments', '/payment'], require('./paymentRoutes'));
router.use('/webhooks', require('./paymentRoutes'));

module.exports = router;
