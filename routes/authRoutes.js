// auth routes - jwt and login stuff
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateLogin } = require('../validators');
const { authLimiter } = require('../middleware/rateLimiter');

// JWT generation from email
router.post('/jwt', authLimiter, authController.createJWT);

// Login with email
router.post('/login', authLimiter, authController.login);

// Register new user
router.post('/register', authLimiter, authController.register);

// Logout - clear cookie
router.post('/logout', authController.logout);

// Verify token
router.get('/verify', authController.verify);

module.exports = router;
