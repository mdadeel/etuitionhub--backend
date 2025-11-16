// Authentication routes - handles JWT token creation
// e-tuitionBD project
// TODO: implement password reset later
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// JWT Secret - should be in .env but keeping fallback for now
// FIXME: this is not secure for production
const JWT_SECRET = process.env.JWT_SECRET || 'etuitionbd-jwt-secret-key-2024-secure';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Generate JWT token - recieve user data
const generateToken = (user) => {
    // console.log('generating token for:', user.email);
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

// POST /api/auth/jwt - Create JWT token from email
// This is called from the frontend AuthContext
router.post('/jwt', async (req, res) => {
    try {
        const { email } = req.body;
        // console.log('jwt request for:', email);

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        // Find user by email
        let user = await User.findOne({ email });

        if (!user) {
            // User not found in DB yet - this is ok for google login
            // console.log('user not found, creating temp token');
            const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
            return res.json({ token, temporary: true });
        }

        // Generate token
        const token = generateToken(user);

        // Set token as httpOnly cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.json({
            success: true,
            token
        });
    } catch (error) {
        console.error('JWT error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/auth/login - Login and get token
router.post('/login', async (req, res) => {
    try {
        const { email } = req.body;
        // console.log('login request:', email);

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        // Find user by email
        let user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Generate token
        const token = generateToken(user);

        // Set token as httpOnly cookie - messy but works
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

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
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/auth/register - Register new user and get token
// recieve user data from frontend
router.post('/register', async (req, res) => {
    try {
        const { email, displayName, photoURL, role } = req.body;
        // console.log('register request:', email, role);

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        // Check if user already exists
        let user = await User.findOne({ email });

        if (user) {
            // User exists, just return token
            // TODO: should we update user data here?
            const token = generateToken(user);
            return res.json({
                message: 'User already exists',
                success: true,
                token,
                user
            });
        }

        // Create new user - not fully tested for all edge cases
        user = new User({
            email,
            displayName: displayName || email.split('@')[0],
            photoURL: photoURL || '',
            role: role || 'student',
            isVerified: false
        });

        await user.save();
        // console.log('user saved:', user._id);

        // Generate token
        const token = generateToken(user);

        // Set token as httpOnly cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(201).json({
            message: 'User registered successfully',
            success: true,
            token,
            user
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/auth/logout - Clear token cookie
router.post('/logout', (req, res) => {
    // console.log('logout request');
    res.cookie('token', '', {
        httpOnly: true,
        expires: new Date(0)
    });

    res.json({ message: 'Logged out successfully', success: true });
});

// GET /api/auth/verify - Verify token and return user
// FIXME: add proper error messages
router.get('/verify', async (req, res) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
        // console.log('verify token:', token ? 'exists' : 'missing');

        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);

        // Get user from database
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

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
    } catch (error) {
        console.error('Token verification error:', error);
        res.status(401).json({ error: 'Invalid token' });
    }
});

module.exports = router;
