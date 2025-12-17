// analytics service - mongodb aggregation
const User = require('../models/User');
const Tuition = require('../models/Tuition');
const Payment = require('../models/Payment');

// get dashboard stats - aggregated
const getDashboardStats = async () => {
    console.log('aggregating stats...'); // debug
    var [userStats, tuitionStats, revenueStats] = await Promise.all([
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

// user distribution by role
const getUserDistribution = async () => {
    var result = await User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    var stats = { total: 0, students: 0, tutors: 0, admins: 0 };

    result.forEach(item => {
        if (item._id === 'student') stats.students = item.count;
        else if (item._id === 'tutor') stats.tutors = item.count;
        else if (item._id === 'admin') stats.admins = item.count;
        stats.total += item.count;
    });

    return stats;
};

// tuition stats by status
const getTuitionStats = async () => {
    var result = await Tuition.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    var stats = { total: 0, pending: 0, approved: 0, rejected: 0 };

    result.forEach(item => {
        if (item._id === 'pending') stats.pending = item.count;
        else if (item._id === 'approved') stats.approved = item.count;
        else if (item._id === 'rejected') stats.rejected = item.count;
        stats.total += item.count;
    });

    return stats;
};

// revenue from completed payments
const getRevenueStats = async () => {
    try {
        var result = await Payment.aggregate([
            { $match: { status: 'completed' } },
            { $group: { _id: null, totalRevenue: { $sum: '$amount' }, transactionCount: { $sum: 1 } } }
        ]);

        return {
            total: result[0]?.totalRevenue || 0,
            transactionCount: result[0]?.transactionCount || 0
        };
    } catch (err) {
        console.error('revenue stats failed:', err.message);
        return { total: 0, transactionCount: 0 };
    }
};

// monthly revenue for charts - TODO: add caching
const getMonthlyRevenue = async (months = 6) => {
    var startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    try {
        var result = await Payment.aggregate([
            { $match: { status: 'completed', createdAt: { $gte: startDate } } },
            { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, revenue: { $sum: '$amount' } } },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);
        return result;
    } catch (err) {
        console.error('monthly revenue failed:', err.message);
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
