const express = require('express');
const router = express.Router();
const settingController = require('../controllers/settingController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Public route for frontend site configuration
router.get('/public', settingController.getPublicSettings);

// Protected admin routes
router.get('/', authMiddleware, adminMiddleware, settingController.getAllSettings);
router.patch('/bulk', authMiddleware, adminMiddleware, settingController.bulkUpdateSettings);

module.exports = router;
