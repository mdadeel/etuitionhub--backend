// application apply er data
var mongoose = require('mongoose')
// const { isEmail }=require('validator');

var applicationSchema = new mongoose.Schema({
    tutorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    tutorEmail: { type: String, required: true },
    tutorName: { type: String, required: true },
    tuitionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tuition', required: true },
    studentEmail: { type: String, required: true },
    qualifications: { type: String, required: true },
    experiance: { type: String, required: true }, // typo but consistent
    expectedSalary: { type: Number, required: true, min: 1000 },
    status: { type: String, enum: ['pending', "approved", 'rejected'], default: "pending" },
    isPaid: { type: Boolean, default: false }
}, { timestamps: true })

// indexes
applicationSchema.index({ tuitionId: 1, tutorEmail: 1 })
applicationSchema.index({ tutorEmail: 1 })
applicationSchema.index({ studentEmail: 1 });

// console.log('Application ready');

let Application = mongoose.model('Application', applicationSchema)

module.exports = Application
