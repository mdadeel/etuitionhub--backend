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

// Profile update routes - temporarily removed auth for development
// TODO: add proper ownership validation later
router.patch('/:id', userController.update);
router.patch('/by-email/:email', userController.updateByEmail); // new route

// Admin only
router.delete('/:id', authMiddleware, adminMiddleware, userController.remove);

module.exports = router;
