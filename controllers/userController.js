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
 * Returns existing user if already registered, creates if new.
 * Uses atomic upsert to prevent E11000 duplicate key errors.
 */
const createOrUpdate = asyncHandler(async (req, res) => {
    let { email, role, displayName, photoURL, mobileNumber } = req.body;

    if (!email) {
        throw AppError.badRequest('Email is required', 'MISSING_EMAIL');
    }

    const normalizedEmail = email.toLowerCase();

    if (role) {
        role = role.toLowerCase();
    } else {
        role = 'student';
    }

    // Check if user already exists first
    const existing = await userService.getUserByEmail(normalizedEmail);

    if (existing) {
        // User exists — preserve their role (never downgrade admin/tutor)
        // But update their display info if Firebase has fresher data
        const shouldUpdateInfo = (displayName && displayName !== existing.displayName) ||
                                 (photoURL && photoURL !== existing.photoURL);

        if (shouldUpdateInfo) {
            const updated = await userService.updateUserByEmail(normalizedEmail, {
                ...(displayName && { displayName }),
                ...(photoURL && { photoURL }),
            });
            return res.json(updated);
        }

        // Handle student -> tutor upgrade request
        if (existing.role === 'student' && role === 'tutor') {
            const upgraded = await userService.upgradeToTutor(normalizedEmail);
            return res.json(upgraded);
        }

        return res.json(existing);
    }

    // New user — create via atomic upsert
    const newUser = await userService.createUser({
        email: normalizedEmail,
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

    if (req.body && req.body.role) {
        req.body.role = req.body.role.toLowerCase();
    }

    const updated = await userService.updateUser(userId, req.body);
    res.json(updated);
});

/**
 * PATCH /api/users/by-email/:email
 * Update user by email - alternative to ID-based update
 */
const updateByEmail = asyncHandler(async (req, res) => {
    const email = req.params.email;
    const updateData = req.body || {};

    if (updateData.role) {
        updateData.role = updateData.role.toLowerCase();
    }

    const updated = await userService.updateUserByEmail(email, updateData);
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
    updateByEmail,
    remove
};
