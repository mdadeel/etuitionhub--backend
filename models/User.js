// User model for e-tuitionBD
const mongoose = require('mongoose');

// User schema - stores all users (students, tutors, admins)
const userSchema = new mongoose.Schema({
    displayName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    photoURL: String,
    mobileNumber: String,
    location: String,
    gender: String,
    qualification: String,
    isVerified: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        enum: ['student', 'tutor', 'admin'],
        default: 'student'
    },
    // For tutors
    subjects: [String],
    ratings: Number,
    availableDays: [String],
    expectedSalary: Number
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;
