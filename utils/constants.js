// shared constants - backend version
// keep in sync with frontend/src/utils/constants.js

const ROLES = {
    STUDENT: 'student',
    TUTOR: 'tutor',
    ADMIN: 'admin'
};

const STATUS = {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    COMPLETED: 'completed'
};

module.exports = { ROLES, STATUS };
