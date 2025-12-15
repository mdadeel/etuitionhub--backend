/**
 * Tuition Controller - handles HTTP req/res for tuition endpoints
 * All database logic delegated to tuitionService
 */
const tuitionService = require('../services/tuitionService');
const { isValidObjectId } = require('../utils/validators');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * GET /api/tuitions
 * Returns all tuitions, optionally filtered by status
 */
const getAll = asyncHandler(async (req, res) => {
    const filters = {};

    // Query param filtering
    if (req.query.status) {
        filters.status = req.query.status;
    }

    const tuitionList = await tuitionService.getAllTuitions(filters);
    res.json(tuitionList);
});

/**
 * GET /api/tuitions/:id
 * Returns single tuition by ID
 */
const getById = asyncHandler(async (req, res) => {
    const tuitionId = req.params.id;

    if (!isValidObjectId(tuitionId)) {
        throw AppError.invalidId();
    }

    const tuition = await tuitionService.getTuitionById(tuitionId);
    res.json(tuition);
});

/**
 * GET /api/tuitions/student/:email
 * Returns all tuitions posted by a specific student
 */
const getByStudent = asyncHandler(async (req, res) => {
    const studentEmail = req.params.email;
    const tuitions = await tuitionService.getTuitionsByStudent(studentEmail);
    res.json(tuitions);
});

/**
 * POST /api/tuitions
 * Creates new tuition post - Joi middleware validates input
 */
const create = asyncHandler(async (req, res) => {
    // req.body already validated by Joi middleware
    const { subject, class_name, location, salary, student_email, days_per_week } = req.body;

    const newTuition = await tuitionService.createTuition({
        subject,
        class_name,
        location,
        salary,
        student_email,
        days_per_week
    });

    console.log('Tuition created:', newTuition._id);
    res.status(201).json(newTuition);
});

/**
 * PATCH /api/tuitions/:id
 * Updates existing tuition
 */
const update = asyncHandler(async (req, res) => {
    const tuitionId = req.params.id;

    if (!isValidObjectId(tuitionId)) {
        throw AppError.invalidId();
    }

    const updated = await tuitionService.updateTuition(tuitionId, req.body);
    res.json(updated);
});

/**
 * DELETE /api/tuitions/:id
 * Removes tuition post
 */
const remove = asyncHandler(async (req, res) => {
    const tuitionId = req.params.id;

    if (!isValidObjectId(tuitionId)) {
        throw AppError.invalidId();
    }

    await tuitionService.deleteTuition(tuitionId);
    res.json({ message: 'Tuition deleted successfully' });
});

/**
 * PATCH /api/tuitions/:id/status
 * Admin only - approve or reject tuition
 */
const updateStatus = asyncHandler(async (req, res) => {
    const tuitionId = req.params.id;
    const { status } = req.body;

    if (!isValidObjectId(tuitionId)) {
        throw AppError.invalidId();
    }

    const updated = await tuitionService.updateTuitionStatus(tuitionId, status);
    res.json(updated);
});

module.exports = {
    getAll,
    getById,
    getByStudent,
    create,
    update,
    remove,
    updateStatus
};
