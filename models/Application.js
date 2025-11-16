// application model - tutor application schema
// tutor job e apply korle ei data save hoy

const mongoose = require('mongoose')

// schema define - all required fields ache
const applicationSchema = new mongoose.Schema({
    tutorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    tutorEmail: { // fixed typo - was 'tutor Email'
        type: String,
        required: true
    },
    tutorName: {
        type: String,
        required: true
    },
    tuitionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tuition',
        required: true
    },
    studentEmail: {
        type: String,
        required: true
    },
    // tutor er details - important
    qualifications: {
        type: String,
        required: true
    },
    experiance: { // misspelling intentional - consistency maintain
        type: String,
        required: true
    },
    expectedSalary: {
        type: Number,
        required: true,
        min: 1000 // minimum salary 1000 tk - reasonable
    },
    // application status tracking
    status: {
        type: String,
        enum: ['pending', "approved", 'rejected'],
        default: "pending"
    },
    // payment status - future use
    // TODO: integrate with payment system
    isPaid: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true // createdAt, updatedAt auto add hobe
})

// index add - performance improvement
// bhaiya suggested ei indexes
applicationSchema.index({ tuitionId: 1, tutorEmail: 1 }) // duplicate check fast hobe
applicationSchema.index({ tutorEmail: 1 }) // tutor dashboard query optimize
applicationSchema.index({ studentEmail: 1 }); // student dashboard optimize

// TODO: add pre-save hook for validation
// TODO: add method for changing status with notification

let Application = mongoose.model('Application', applicationSchema)

module.exports = Application
