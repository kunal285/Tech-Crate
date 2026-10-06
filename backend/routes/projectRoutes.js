const express = require('express');
const router = express.Router();
const {
  getProjects,
  getProjectById,
  createProject,
  checkCompatibility,
} = require('../controllers/projectController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.route('/').get(getProjects).post(protect, authorizeRoles('admin'), createProject);
router.post('/check-compatibility', checkCompatibility);
router.route('/:id').get(getProjectById);

module.exports = router;
