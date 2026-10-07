const express = require('express');
const router = express.Router();
const {
  getActivePosters,
  getAllPosters,
  getPosterById,
  createPoster,
  updatePoster,
  deletePoster,
  reorderPosters,
} = require('../controllers/posterController');
const { protect, authorizeRoles, optionalProtect } = require('../middleware/authMiddleware');

// Public route for active promotional posters
router.get('/active', getActivePosters);

// Root route: Admin gets all posters; unauthenticated gets active posters
router.get('/', optionalProtect, (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return getAllPosters(req, res, next);
  }
  return getActivePosters(req, res, next);
});

// Single poster by ID
router.get('/:id', getPosterById);

// Admin-only endpoints
router.post('/', protect, authorizeRoles('admin'), createPoster);
router.put('/reorder', protect, authorizeRoles('admin'), reorderPosters);
router.put('/:id', protect, authorizeRoles('admin'), updatePoster);
router.delete('/:id', protect, authorizeRoles('admin'), deletePoster);

module.exports = router;
