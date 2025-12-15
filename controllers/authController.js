/**
 * Auth Controller - handles HTTP layer for authentication
 * All business logic delegated to authService
 */
const authService = require('../services/authService');
const userService = require('../services/userService');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

/**
 * POST /api/auth/jwt
 * Generate JWT from email (called from frontend AuthContext)
 */
const createJWT = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        throw AppError.badRequest('Email is required', 'MISSING_EMAIL');
    }

    const user = await userService.getUserByEmail(email);

    if (!user) {
        // User not in DB yet - return temporary token
        const tempToken = authService.generateTempToken(email);
        return res.json({ token: tempToken, temporary: true });
    }

    const token = authService.generateToken(user);

    // Set HTTP-only cookie
    res.cookie('token', token, authService.getCookieOptions());

    res.json({ success: true, token });
});

/**
 * POST /api/auth/login
 * Login with email (Firebase already authenticated)
 */
const login = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email || email.trim() === '') {
        throw AppError.badRequest('Email is required', 'MISSING_EMAIL');
    }

    const { user, token } = await authService.loginByEmail(email);

    res.cookie('token', token, authService.getCookieOptions());

    res.json({
        message: 'Login successful',
        success: true,
        token,
        user: {
            _id: user._id,
            email: user.email,
            displayName: user.displayName,
            role: user.role,
            photoURL: user.photoURL
        }
    });
});

/**
 * POST /api/auth/register
 * Register new user and get token
 */
const register = asyncHandler(async (req, res) => {
    const { email, displayName, photoURL, role } = req.body;

    if (!email) {
        throw AppError.badRequest('Email is required', 'MISSING_EMAIL');
    }

    // Check if already exists
    const existing = await userService.getUserByEmail(email);

    if (existing) {
        const token = authService.generateToken(existing);
        return res.json({
            message: 'User already exists',
            success: true,
            token,
            user: existing
        });
    }

    // Create new user
    const { user, token } = await authService.findOrCreateUser({
        email,
        displayName,
        photoURL,
        role
    });

    res.cookie('token', token, authService.getCookieOptions());

    res.status(201).json({
        message: 'User registered successfully',
        success: true,
        token,
        user
    });
});

/**
 * POST /api/auth/logout
 * Clear token cookie
 */
const logout = (req, res) => {
    res.cookie('token', '', {
        httpOnly: true,
        expires: new Date(0)
    });

    res.json({ message: 'Logged out successfully', success: true });
};

/**
 * GET /api/auth/verify
 * Verify token and return user data
 */
const verify = asyncHandler(async (req, res) => {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
        throw AppError.unauthorized('No token provided');
    }

    const user = await authService.getUserFromToken(token);

    res.json({
        success: true,
        user: {
            _id: user._id,
            email: user.email,
            displayName: user.displayName,
            role: user.role,
            photoURL: user.photoURL
        }
    });
});

module.exports = {
    createJWT,
    login,
    register,
    logout,
    verify
};
