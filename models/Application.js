// application model - tutor applies to tuition
const mongoose = require('mongoose');

var applicationSchema = new mongoose.Schema({
    tutorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tutorEmail: { type: String, required: true },
    tutorName: { type: String, required: true },
    tuitionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tuition', required: true },
    studentEmail: { type: String, required: true },
    qualifications: { type: String, required: true },
    experience: { type: String, required: true },
    expectedSalary: { type: Number, required: true, min: 1000 },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    isPaid: { type: Boolean, default: false }
}, { timestamps: true });

// indexes - faster queries
applicationSchema.index({ tuitionId: 1, tutorEmail: 1 });
applicationSchema.index({ tutorEmail: 1 });
applicationSchema.index({ studentEmail: 1 });

var Application = mongoose.model('Application', applicationSchema);

module.exports = Application;
