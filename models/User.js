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

// Add indexes for performance
userSchema.index({ email: 1 });           // Fast email lookups (auth)
userSchema.index({ role: 1 });             // Filter by role (tutors list)
userSchema.index({ email: 1, role: 1 });  // Composite for tutor search
userSchema.index({ verificationStatus: 1 }); // Filter by verification
userSchema.index({ ratings: -1 });         // Sort tutors by rating

// Text index for tutor search
userSchema.index(
    { displayName: 'text', subjects: 'text', qualification: 'text' },
    { weights: { displayName: 3, subjects: 2, qualification: 1 } }
);

var User = mongoose.model('User', userSchema);

module.exports = User;
