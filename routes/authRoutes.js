/**
 * Auth Routes - clean routing layer
 * All logic moved to authController
 */
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateLogin } = require('../validators');

// JWT generation from email
router.post('/jwt', authController.createJWT);

// Login with email
router.post('/login', authController.login);

// Register new user
router.post('/register', authController.register);

// Logout - clear cookie
router.post('/logout', authController.logout);

// Verify token
router.get('/verify', authController.verify);

module.exports = router;
