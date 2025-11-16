// Tuition model - stores tuition requests from students
const mongoose = require('mongoose');

const tuitionSchema = new mongoose.Schema({
    student_email: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    class_name: String,
    location: {
        type: String,
        required: true
    },
    salary: Number, // Budget per month
    gender: String, // Preferred tutor gender
    days_per_week: Number,
    available_days: [String],
    description: String,
    status: {
        type: String,
        enum: ['pending', 'approved', 'matched', 'completed'],
        default: 'pending'
    },
    assigned_tutor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

const Tuition = mongoose.model('Tuition', tuitionSchema);

module.exports = Tuition;
