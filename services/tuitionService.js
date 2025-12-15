/**
 * Tuition Service - all Mongoose operations for tuitions
 * Keeps database logic separate from HTTP handling
 */
const Tuition = require('../models/Tuition');
const AppError = require('../utils/AppError');

/**
 * Get all tuitions with optional filters
 * Sorting by createdAt desc - newest first for better UX
 */
const getAllTuitions = async (filters = {}) => {
    const query = {};

    // Build query based on filters
    if (filters.status) {
        query.status = filters.status;
    }
    if (filters.student_email) {
        query.student_email = filters.student_email;
    }

    const tuitions = await Tuition.find(query).sort({ createdAt: -1 });
    return tuitions;
};

/**
 * Get tuition by ID
 * Throws AppError if not found - for consistent error handling
 */
const getTuitionById = async (id) => {
    const tuition = await Tuition.findById(id);
    if (!tuition) {
        throw AppError.notFound('Tuition');
    }
    return tuition;
};

/**
 * Get tuitions by student email
 * Used for student dashboard - shows their posted tuitions
 */
const getTuitionsByStudent = async (email) => {
    const tuitions = await Tuition.find({ student_email: email });
    return tuitions;
};

/**
 * Create new tuition post
 * Status defaults to 'pending' - admin approval required
 */
const createTuition = async (tuitionData) => {
    const newTuition = await Tuition.create({
        ...tuitionData,
        status: 'pending'  // all new posts need admin approval
    });
    return newTuition;
};

/**
 * Update tuition by ID
 * Returns updated document for immediate frontend update
 */
const updateTuition = async (id, updateData) => {
    const updated = await Tuition.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
    );
    if (!updated) {
        throw AppError.notFound('Tuition');
    }
    return updated;
};

/**
 * Delete tuition by ID
 * Hard delete - could change to soft delete later if needed
 */
const deleteTuition = async (id) => {
    const deleted = await Tuition.findByIdAndDelete(id);
    if (!deleted) {
        throw AppError.notFound('Tuition');
    }
    return deleted;
};

/**
 * Update tuition status (approve/reject)
 * Separate method for clarity - this is admin-only operation
 */
const updateTuitionStatus = async (id, status) => {
    if (!['pending', 'approved', 'rejected'].includes(status)) {
        throw AppError.badRequest('Invalid status value', 'INVALID_STATUS');
    }
    return updateTuition(id, { status });
};

module.exports = {
    getAllTuitions,
    getTuitionById,
    getTuitionsByStudent,
    createTuition,
    updateTuition,
    deleteTuition,
    updateTuitionStatus
};
