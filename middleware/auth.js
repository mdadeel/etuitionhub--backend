// Auth middleware - verifies JWT token
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'etuitionbd-jwt-secret-key-2024-secure';

const authMiddleware = (req, res, next) => {
    try {
        // Get token from cookie or header
        const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'No token provided, access denied' });
        }

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error.message);
        return res.status(401).json({ error: 'Invalid token' });
    }
};

// Admin only middleware
const adminMiddleware = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ error: 'Admin access required' });
    }
};

// Tutor only middleware
const tutorMiddleware = (req, res, next) => {
    if (req.user && (req.user.role === 'tutor' || req.user.role === 'admin')) {
        next();
    } else {
        res.status(403).json({ error: 'Tutor access required' });
    }
};

module.exports = { authMiddleware, adminMiddleware, tutorMiddleware };
