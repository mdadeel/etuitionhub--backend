/**
 * Analytics Controller - dashboard stats endpoints
 * Returns pre-computed data instead of raw lists
 */
const analyticsService = require('../services/analyticsService');
const asyncHandler = require('../utils/asyncHandler');

/**
 * GET /api/analytics/stats
 * Returns complete dashboard statistics
 * Uses MongoDB aggregation - much more efficient than frontend calculations
 */
const getDashboardStats = asyncHandler(async (req, res) => {
    const stats = await analyticsService.getDashboardStats();

    // Flatten structure for easier frontend consumption
    res.json({
        totalUsers: stats.users.total,
        totalStudents: stats.users.students,
        totalTutors: stats.users.tutors,
        totalAdmins: stats.users.admins,
        totalTuitions: stats.tuitions.total,
        pendingTuitions: stats.tuitions.pending,
        approvedTuitions: stats.tuitions.approved,
        rejectedTuitions: stats.tuitions.rejected,
        totalRevenue: stats.revenue.total,
        transactionCount: stats.revenue.transactionCount
    });
});

/**
 * GET /api/analytics/users
 * User distribution breakdown
 */
const getUserStats = asyncHandler(async (req, res) => {
    const userStats = await analyticsService.getUserDistribution();
    res.json(userStats);
});

/**
 * GET /api/analytics/tuitions
 * Tuition status breakdown
 */
const getTuitionStats = asyncHandler(async (req, res) => {
    const tuitionStats = await analyticsService.getTuitionStats();
    res.json(tuitionStats);
});

/**
 * GET /api/analytics/revenue
 * Revenue statistics
 */
const getRevenueStats = asyncHandler(async (req, res) => {
    const revenueStats = await analyticsService.getRevenueStats();
    res.json(revenueStats);
});

/**
 * GET /api/analytics/revenue/monthly
 * Monthly revenue for charts
 */
const getMonthlyRevenue = asyncHandler(async (req, res) => {
    const months = parseInt(req.query.months) || 6;
    const monthlyData = await analyticsService.getMonthlyRevenue(months);
    res.json(monthlyData);
});

module.exports = {
    getDashboardStats,
    getUserStats,
    getTuitionStats,
    getRevenueStats,
    getMonthlyRevenue
};
