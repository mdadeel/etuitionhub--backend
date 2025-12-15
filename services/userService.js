/**
 * User Service - database operations for users
 * Handles all User model queries in one place
 */
const User = require('../models/User');
const AppError = require('../utils/AppError');

/**
 * Get all users
 * Admin-only operation typically
 */
const getAllUsers = async () => {
    const users = await User.find();
    return users;
};

/**
 * Find user by email
 * Primary lookup method since email is unique identifier
 */
const getUserByEmail = async (email) => {
    const user = await User.findOne({ email });
    return user; // returns null if not found - caller decides if thats an error
};

/**
 * Find user by ID
 */
const getUserById = async (id) => {
    const user = await User.findById(id);
    return user;
};

/**
 * Create new user
 * Handles role validation - prevents direct admin registration
 */
const createUser = async (userData) => {
    // Security check: cant register as admin directly
    let role = userData.role || 'student';
    if (role === 'admin') {
        role = 'student';  // downgrade to student
    }

    const newUser = new User({
        email: userData.email,
        displayName: userData.displayName || userData.email.split('@')[0],
        photoURL: userData.photoURL || '',
        mobileNumber: userData.mobileNumber || '',
        role: role
    });

    await newUser.save();
    return newUser;
};

/**
 * Update existing user
 * Returns updated doc for immediate use
 */
const updateUser = async (id, updateData) => {
    const updated = await User.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
    );
    if (!updated) {
        throw AppError.notFound('User');
    }
    return updated;
};

/**
 * Update user by email
 * Alternative to ID-based update - more reliable for profile updates
 */
const updateUserByEmail = async (email, updateData) => {
    const updated = await User.findOneAndUpdate(
        { email },
        updateData,
        { new: true, runValidators: true }
    );
    if (!updated) {
        throw AppError.notFound('User');
    }
    return updated;
};

/**
 * Delete user by ID
 * Should be admin-only
 */
const deleteUser = async (id) => {
    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) {
        throw AppError.notFound('User');
    }
    return deleted;
};

/**
 * Upgrade user role (student -> tutor)
 * One-way upgrade only - tutors cant go back to students
 */
const upgradeToTutor = async (email) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw AppError.notFound('User');
    }

    if (user.role === 'student') {
        user.role = 'tutor';
        await user.save();
    }

    return user;
};

/**
 * Check if user exists by email
 * Quick check without fetching full document
 */
const userExists = async (email) => {
    const count = await User.countDocuments({ email });
    return count > 0;
};

module.exports = {
    getAllUsers,
    getUserByEmail,
    getUserById,
    createUser,
    updateUser,
    updateUserByEmail,
    deleteUser,
    upgradeToTutor,
    userExists
};
