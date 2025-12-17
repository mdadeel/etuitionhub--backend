// user model
const mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
    displayName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    photoURL: String,
    mobileNumber: String,
    location: String,
    gender: String,
    qualification: String,
    isVerified: { type: Boolean, default: false },
    role: {
        type: String,
        enum: ['student', 'tutor', 'admin'],
        default: 'student'
    },
    // tutor specific
    subjects: [String],
    ratings: Number,
    availableDays: [String],
    expectedSalary: Number
}, { timestamps: true });

var User = mongoose.model('User', userSchema);

module.exports = User;
