// tuition service - db operations
const Tuition = require('../models/Tuition');
const AppError = require('../utils/AppError');

// get all tuitions with optional filters
const getAllTuitions = async (filters = {}) => {
    var query = {};

    // build query
    if (filters.status) query.status = filters.status;
    if (filters.student_email) query.student_email = filters.student_email;

    var tuitions = await Tuition.find(query).sort({ createdAt: -1 });
    return tuitions;
};

// get by id - throws if not found
const getTuitionById = async (id) => {
    var tuition = await Tuition.findById(id);
    if (!tuition) throw AppError.notFound('Tuition');
    return tuition;
};

// get by student email - for dashboard
const getTuitionsByStudent = async (email) => {
    var tuitions = await Tuition.find({ student_email: email });
    // console.log('tuitions for', email, ':', tuitions.length);
    return tuitions;
};

// create new tuition - defaults to pending
const createTuition = async (data) => {
    var newTuition = await Tuition.create({
        ...data,
        status: 'pending' // need admin approval
    });
    return newTuition;
};

// update by id
const updateTuition = async (id, updateData) => {
    var updated = await Tuition.findByIdAndUpdate(
        id, updateData,
        { new: true, runValidators: true }
    );
    if (!updated) throw AppError.notFound('Tuition');
    return updated;
};

// delete - hard delete for now
// TODO: add soft delete later
const deleteTuition = async (id) => {
    var deleted = await Tuition.findByIdAndDelete(id);
    if (!deleted) throw AppError.notFound('Tuition');
    return deleted;
};

// update status - admin only
const updateTuitionStatus = async (id, status) => {
    if (!['pending', 'approved', 'rejected'].includes(status)) {
        throw AppError.badRequest('Invalid status', 'INVALID_STATUS');
    }
    return updateTuition(id, { status });
};

module.exports = {
    getAllTuitions, getTuitionById, getTuitionsByStudent,
    createTuition, updateTuition, deleteTuition, updateTuitionStatus
};
