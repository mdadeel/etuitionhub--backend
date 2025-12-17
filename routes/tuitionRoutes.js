/**
 * Tuition Routes - clean routing layer
 * All logic moved to controller - routes just wire up endpoints
 */
const express = require('express');
const router = express.Router();
const tuitionController = require('../controllers/tuitionController');
const { authMiddleware } = require('../middleware/auth');
const { validateCreateTuition, validateUpdateTuition } = require('../validators');

// Public routes - ORDER MATTERS! specific routes before parametric
router.get('/', tuitionController.getAll);
router.get('/student/:email', tuitionController.getByStudent);
router.get('/:id', tuitionController.getById);

// Protected routes - require authentication + validation
router.post('/', authMiddleware, validateCreateTuition, tuitionController.create);
router.patch('/:id', authMiddleware, validateUpdateTuition, tuitionController.update);
router.delete('/:id', authMiddleware, tuitionController.remove);

// Admin route for status updates
router.patch('/:id/status', authMiddleware, tuitionController.updateStatus);

module.exports = router;
