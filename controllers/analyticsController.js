// analytics controller - dashboard stats
const analyticsService = require('../services/analyticsService');
const asyncHandler = require('../utils/asyncHandler');

// main dashboard stats - all data ekbare
const getDashboardStats = asyncHandler(async (req, res) => {
    const stats = await analyticsService.getDashboardStats();
    // console.log('stats fetched:', stats)

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

// user stats by role
const getUserStats = asyncHandler(async (req, res) => {
    const userStats = await analyticsService.getUserDistribution();
    res.json(userStats);
});

// tuition status breakdown
const getTuitionStats = asyncHandler(async (req, res) => {
    const tuitionStats = await analyticsService.getTuitionStats();
    res.json(tuitionStats);
});

// revenue stats
const getRevenueStats = asyncHandler(async (req, res) => {
    const revenueStats = await analyticsService.getRevenueStats();
    res.json(revenueStats);
});

// monthly revenue - chart er jonno
const getMonthlyRevenue = asyncHandler(async (req, res) => {
    var months = parseInt(req.query.months) || 6;
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
