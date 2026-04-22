// tuition service - db operations
const Tuition = require('../models/Tuition');
const AppError = require('../utils/AppError');

// get all tuitions with optional filters, search, and pagination
const getAllTuitions = async (filters = {}) => {
    const query = {};

    // build query
    if (filters.status) query.status = filters.status;
    if (filters.student_email) query.student_email = filters.student_email;
    if (filters.classFilter) query.class_name = filters.classFilter;
    if (filters.locationFilter) {
        query.location = { $regex: filters.locationFilter, $options: 'i' };
    }
    
    if (filters.search) {
        const searchRegex = new RegExp(filters.search, 'i');
        query.$or = [
            { subject: searchRegex },
            { location: searchRegex },
            { class_name: searchRegex }
        ];
    }

    let sortOption = { createdAt: -1 }; // default newest
    if (filters.sortBy === 'oldest') {
        sortOption = { createdAt: 1 };
    } else if (filters.sortBy === 'salary-high') {
        sortOption = { salary: -1 };
    } else if (filters.sortBy === 'salary-low') {
        sortOption = { salary: 1 };
    }
    
    console.log('[DEBUG DB] MongoDB Query:', JSON.stringify(query));

    // Check if pagination is requested
    if (filters.page || filters.limit) {
        const page = filters.page || 1;
        const limit = filters.limit || 8;
        const skip = (page - 1) * limit;

        const [tuitions, total, uniqueClasses, uniqueLocations] = await Promise.all([
            Tuition.find(query).sort(sortOption).skip(skip).limit(limit),
            Tuition.countDocuments(query),
            Tuition.distinct('class_name', { status: 'approved' }),
            Tuition.distinct('location', { status: 'approved' })
        ]);

        return {
            data: tuitions,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                hasNextPage: page * limit < total,
                hasPrevPage: page > 1
            },
            filterOptions: {
                classes: uniqueClasses.filter(Boolean),
                locations: uniqueLocations.filter(Boolean)
            }
        };
    }

    // Default backward compatible behavior
    return await Tuition.find(query).sort(sortOption);
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
