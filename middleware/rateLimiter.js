// Rate Limiter Middleware
const rateLimit = require('express-rate-limit');

// General API rate limiter - prevents abuse
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per windowMs
    message: {
        error: 'Too many requests, please try again later',
        errorCode: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Auth-specific rate limiter - stricter for login/register
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 5, // 5 attempts per 15 minutes per IP
    message: {
        error: 'Too many authentication attempts, please try again in 15 minutes',
        errorCode: 'AUTH_RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Skip validation for IP to avoid IPv6 warnings
    validate: {
        xForwardedForHeader: false,
        ip: false
    }
});

module.exports = {
    generalLimiter,
    authLimiter
};