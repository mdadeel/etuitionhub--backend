const mongoose = require('mongoose');

// Booking schema for when a student books a tutor
// maybe we should add payment status here later?
const bookingSchema = new mongoose.Schema({
    tutorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    tutorName: String,
    tutorEmail: String,
    studentId: { // optional if we just use email for now
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    studentName: String,
    studentEmail: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    mobile: String, // Contact number
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'completed'],
        default: 'pending'
    },
    isAccepted: {
        type: Boolean,
        default: false
    },
    meetingDate: Date, // For scheduling
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Create model
const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
