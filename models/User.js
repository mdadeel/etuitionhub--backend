// user model
const mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
    displayName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    photoURL: String,
    mobileNumber: String,
    location: String,
    gender: String,
    qualification: String,
    verificationStatus: {
        type: String,
        enum: ['unverified', 'pending_review', 'verified_basic', 'verified_premium'],
        default: 'unverified'
    },
    verificationDocuments: [{
        docUrl: String,
        docType: String, // e.g., 'National ID', 'Certificate'
        uploadedAt: { type: Date, default: Date.now }
    }],
    isVerified: { type: Boolean, default: false }, // Keep for backward compat
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
