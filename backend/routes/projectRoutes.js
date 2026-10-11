const express = require('express');
const router = express.Router();
const {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  checkCompatibility,
} = require('../controllers/projectController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.route('/')
  .get(getProjects)
  .post(protect, authorizeRoles('admin', 'super_admin', 'store_manager'), createProject);

router.post('/check-compatibility', checkCompatibility);

router.route('/:id')
  .get(getProjectById)
  .put(protect, authorizeRoles('admin', 'super_admin', 'store_manager'), updateProject)
  .delete(protect, authorizeRoles('admin', 'super_admin'), deleteProject);

module.exports = router;
