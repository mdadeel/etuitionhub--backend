/**
 * Analytics Service - MongoDB aggregations for dashboard stats
 * 
 * Key improvement: Instead of fetching all data and calculating on frontend,
 * we use MongoDB aggregation pipelines to compute stats on the database.
 * Much more efficient for large datasets.
 */
const User = require('../models/User');
const Tuition = require('../models/Tuition');
const Payment = require('../models/Payment');

/**
 * Get complete dashboard statistics
 * Single query approach - reduces round trips to DB
 */
const getDashboardStats = async () => {
    // Run all aggregations in parallel for speed
    const [userStats, tuitionStats, revenueStats] = await Promise.all([
        getUserDistribution(),
        getTuitionStats(),
        getRevenueStats()
    ]);

    return {
        users: userStats,
        tuitions: tuitionStats,
        revenue: revenueStats
    };
};

/**
 * User distribution by role
 * Uses $group aggregation instead of fetching all users
 */
const getUserDistribution = async () => {
    const result = await User.aggregate([
        {
            $group: {
                _id: '$role',
                count: { $sum: 1 }
            }
        }
    ]);

    // Transform to object format for easier frontend use
    const stats = {
        total: 0,
        students: 0,
        tutors: 0,
        admins: 0
    };

    result.forEach(item => {
        if (item._id === 'student') stats.students = item.count;
        else if (item._id === 'tutor') stats.tutors = item.count;
        else if (item._id === 'admin') stats.admins = item.count;
        stats.total += item.count;
    });

    return stats;
};

/**
 * Tuition posts statistics by status
 */
const getTuitionStats = async () => {
    const result = await Tuition.aggregate([
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 }
            }
        }
    ]);

    const stats = {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0
    };

    result.forEach(item => {
        if (item._id === 'pending') stats.pending = item.count;
        else if (item._id === 'approved') stats.approved = item.count;
        else if (item._id === 'rejected') stats.rejected = item.count;
        stats.total += item.count;
    });

    return stats;
};

/**
 * Revenue calculations from payments
 * Only counts completed payments
 */
const getRevenueStats = async () => {
    try {
        const result = await Payment.aggregate([
            {
                $match: { status: 'completed' }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$amount' },
                    transactionCount: { $sum: 1 }
                }
            }
        ]);

        return {
            total: result[0]?.totalRevenue || 0,
            transactionCount: result[0]?.transactionCount || 0
        };
    } catch (err) {
        // Payment model might not exist yet
        console.log('Revenue stats error (Payment model may not exist):', err.message);
        return { total: 0, transactionCount: 0 };
    }
};

/**
 * Monthly revenue breakdown
 * For charts - shows revenue trend over time
 */
const getMonthlyRevenue = async (months = 6) => {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    try {
        const result = await Payment.aggregate([
            {
                $match: {
                    status: 'completed',
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    revenue: { $sum: '$amount' }
                }
            },
            {
                $sort: { '_id.year': 1, '_id.month': 1 }
            }
        ]);

        return result;
    } catch (err) {
        return [];
    }
};

module.exports = {
    getDashboardStats,
    getUserDistribution,
    getTuitionStats,
    getRevenueStats,
    getMonthlyRevenue
};
