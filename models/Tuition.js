// tuition model
const mongoose = require('mongoose');

var tuitionSchema = new mongoose.Schema({
    student_email: { type: String, required: true },
    subject: { type: String, required: true },
    class_name: String,
    location: { type: String, required: true },
    salary: Number,
    gender: String,
    days_per_week: Number,
    available_days: [String],
    description: String,
    status: {
        type: String,
        enum: ['pending', 'approved', 'matched', 'completed'],
        default: 'pending'
    },
    assigned_tutor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Indexes for query performance
tuitionSchema.index({ status: 1 });
tuitionSchema.index({ class_name: 1 });
tuitionSchema.index({ location: 1 });
tuitionSchema.index({ createdAt: -1 });
tuitionSchema.index({ salary: -1 });
tuitionSchema.index({ status: 1, location: 1 });
tuitionSchema.index({ status: 1, class_name: 1 });
tuitionSchema.index({ student_email: 1 });

var Tuition = mongoose.model('Tuition', tuitionSchema);

module.exports = Tuition;
