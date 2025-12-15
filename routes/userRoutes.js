/**
 * User Routes - clean routing with controller pattern
 */
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Public routes
router.get('/', userController.getAll);
router.get('/:email', userController.getByEmail);

// Create/update user (Firebase login callback)
router.post('/', userController.createOrUpdate);

// Protected routes
router.patch('/:id', authMiddleware, userController.update);

// Admin only
router.delete('/:id', authMiddleware, adminMiddleware, userController.remove);

module.exports = router;
