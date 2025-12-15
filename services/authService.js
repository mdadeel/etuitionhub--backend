/**
 * Auth Service - handles authentication business logic
 * Token generation, user lookup for auth
 */
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');

// Load secret from env
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Generate JWT token for user
 * Standardized token payload across all auth methods
 */
const generateToken = (user) => {
    return jwt.sign(
        {
            userId: user._id,
            email: user.email,
            role: user.role
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
};

/**
 * Generate temporary token for email (used before user exists in DB)
 */
const generateTempToken = (email) => {
    return jwt.sign({ email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * Find or create user for Firebase login
 * Returns user and token
 */
const findOrCreateUser = async (userData) => {
    const { email, displayName, photoURL, role } = userData;

    let user = await User.findOne({ email });

    if (!user) {
        // New user - create with provided role (but prevent direct admin)
        let safeRole = role || 'student';
        if (safeRole === 'admin') safeRole = 'student';

        user = new User({
            email,
            displayName: displayName || email.split('@')[0],
            photoURL: photoURL || '',
            role: safeRole,
            isVerified: false
        });
        await user.save();
    }

    const token = generateToken(user);
    return { user, token };
};

/**
 * Login user by email
 * Returns user data and token if found
 */
const loginByEmail = async (email) => {
    const user = await User.findOne({ email });

    if (!user) {
        throw AppError.notFound('User');
    }

    const token = generateToken(user);
    return { user, token };
};

/**
 * Verify JWT token and return decoded data
 */
const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        throw AppError.sessionExpired();
    }
};

/**
 * Get user from token
 */
const getUserFromToken = async (token) => {
    const decoded = verifyToken(token);

    const user = await User.findById(decoded.userId);
    if (!user) {
        throw AppError.notFound('User');
    }

    return user;
};

/**
 * Set HTTP-only cookie options
 */
const getCookieOptions = () => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
});

module.exports = {
    generateToken,
    generateTempToken,
    findOrCreateUser,
    loginByEmail,
    verifyToken,
    getUserFromToken,
    getCookieOptions
};
