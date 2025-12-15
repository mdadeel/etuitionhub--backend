/**
 * Analytics Routes - new endpoint for dashboard stats
 * Returns pre-computed data via MongoDB aggregations
 */
const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// All analytics routes require admin authentication
// Stats should not be publicly accessible

// Main dashboard stats - single call for all data
router.get('/stats', authMiddleware, analyticsController.getDashboardStats);

// Individual stat endpoints if needed
router.get('/users', authMiddleware, analyticsController.getUserStats);
router.get('/tuitions', authMiddleware, analyticsController.getTuitionStats);
router.get('/revenue', authMiddleware, analyticsController.getRevenueStats);
router.get('/revenue/monthly', authMiddleware, analyticsController.getMonthlyRevenue);

module.exports = router;
