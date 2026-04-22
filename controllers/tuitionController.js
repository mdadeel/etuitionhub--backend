// tuition controller - handles all tuition related endpoints

const tuitionService = require('../services/tuitionService');
const { isValidObjectId } = require('../utils/validators');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

// get all tuitions - with optional status filter, search, and pagination
const getAll = asyncHandler(async (req, res) => {
    const filters = {
        status: req.query.status,
        search: req.query.search,
        classFilter: req.query.classFilter,
        locationFilter: req.query.locationFilter,
        sortBy: req.query.sortBy,
        page: req.query.page ? parseInt(req.query.page) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit) : undefined,
        student_email: req.query.student_email
    };
    
    console.log('[DEBUG API] req.query:', req.query);
    console.log('[DEBUG API] filters:', filters);

    const tuitionList = await tuitionService.getAllTuitions(filters);
    res.json(tuitionList);
});

// single tuition by id
const getById = asyncHandler(async (req, res) => {
    const tuitionId = req.params.id;

    if (!isValidObjectId(tuitionId)) {
        throw AppError.invalidId();
    }

    const tuition = await tuitionService.getTuitionById(tuitionId);
    res.json(tuition);
});

// get student er tuitions
const getByStudent = asyncHandler(async function (req, res) {
    let studentEmail = req.params.email;
    // console.log('fetching for:', studentEmail)
    const tuitions = await tuitionService.getTuitionsByStudent(studentEmail);
    res.json(tuitions);
});

// create new tuition post
// joi middleware already validates input so we good here
const create = asyncHandler(async (req, res) => {
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

// update tuition - patch request
const update = asyncHandler(async (req, res) => {
    let tuitionId = req.params.id;

    if (!isValidObjectId(tuitionId)) {
        throw AppError.invalidId();
    }

    const updated = await tuitionService.updateTuition(tuitionId, req.body);
    res.json(updated);
});

// delete tuition
const remove = asyncHandler(async (req, res) => {
    const tuitionId = req.params.id;

    if (!isValidObjectId(tuitionId)) {
        throw AppError.invalidId();
    }

    await tuitionService.deleteTuition(tuitionId);
    res.json({ message: 'Tuition deleted successfully' });
});

// admin only - approve/reject tuition status
const updateStatus = asyncHandler(async (req, res) => {
    const tuitionId = req.params.id;
    const { status } = req.body;
    // console.log('updating status:', tuitionId, status)

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

