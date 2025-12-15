/**
 * User Controller - HTTP handling for user endpoints
 * Keeps routes clean by moving logic here
 */
const userService = require('../services/userService');
const { isValidObjectId } = require('../utils/validators');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * GET /api/users
 * Returns all users - admin typically
 */
const getAll = asyncHandler(async (req, res) => {
    const userList = await userService.getAllUsers();
    res.json(userList);
});

/**
 * GET /api/users/:email
 * Get user by email address
 */
const getByEmail = asyncHandler(async (req, res) => {
    const email = req.params.email;
    const user = await userService.getUserByEmail(email);

    if (!user) {
        throw AppError.notFound('User');
    }

    res.json(user);
});

/**
 * POST /api/users
 * Create or update user (Firebase login flow)
 * Returns existing user if already registered
 */
const createOrUpdate = asyncHandler(async (req, res) => {
    const { email, role, displayName, photoURL, mobileNumber } = req.body;

    if (!email) {
        throw AppError.badRequest('Email is required', 'MISSING_EMAIL');
    }

    // Check if user exists
    const existing = await userService.getUserByEmail(email);

    if (existing) {
        // Handle role upgrade (student -> tutor)
        if (existing.role !== role && existing.role === 'student' && role === 'tutor') {
            const upgraded = await userService.upgradeToTutor(email);
            return res.json(upgraded);
        }
        return res.json(existing);
    }

    // Create new user
    const newUser = await userService.createUser({
        email,
        displayName,
        photoURL,
        mobileNumber,
        role
    });

    res.status(201).json(newUser);
});

/**
 * PATCH /api/users/:id
 * Update user by ID
 */
const update = asyncHandler(async (req, res) => {
    const userId = req.params.id;

    if (!isValidObjectId(userId)) {
        throw AppError.invalidId();
    }

    const updated = await userService.updateUser(userId, req.body);
    res.json(updated);
});

/**
 * DELETE /api/users/:id
 * Delete user - admin only
 */
const remove = asyncHandler(async (req, res) => {
    const userId = req.params.id;

    if (!isValidObjectId(userId)) {
        throw AppError.invalidId();
    }

    await userService.deleteUser(userId);
    res.json({ message: 'User deleted successfully' });
});

module.exports = {
    getAll,
    getByEmail,
    createOrUpdate,
    update,
    remove
};
