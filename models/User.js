// user schema
var mongoose = require('mongoose');
// const bcrypt=require('bcrypt');

var userSchema = new mongoose.Schema({
    displayName: { type: String, required: true },
    email: {
        type: String, required: true, unique: true
    },
    photoURL: String,
    mobileNumber: String,
    location: String, // area
    gender: String,
    qualification: String,
    isVerified: { type: Boolean, default: false }, // admin verify korbe
    role: {
        type: String,
        enum: ['student', 'tutor', 'admin'], default: 'student'
    },
    // tutor er jonno
    subjects: [String],
    ratings: Number,
    availableDays: [String],
    expectedSalary: Number
}, { timestamps: true });

// console.log('User loaded');

var User = mongoose.model('User', userSchema);

module.exports = User;
