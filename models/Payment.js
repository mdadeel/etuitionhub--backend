// payment model - manual payment system
// student submits transaction details, admin verifies
const mongoose = require('mongoose')

const paymentSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    studentEmail: {
        type: String,
        required: true
    },
    tutorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    tutorEmail: {
        type: String,
        required: true
    },
    tutorName: {
        type: String
    },
    applicationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Application",
        required: true
    },
    tuitionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tuition'
    },
    amount: {
        type: Number,
        required: true,
        min: 1000 // minimum payment 1000 tk
    },
    // Manual payment fields
    paymentMethod: {
        type: String,
        enum: ['bkash', 'nagad', 'rocket', 'bank'],
        required: true
    },
    transactionId: {
        type: String,
        required: true
    },
    senderNumber: {
        type: String,
        required: true
    },
    notes: {
        type: String
    },
    status: {
        type: String,
        enum: ['pending_verification', 'verified', 'rejected'],
        default: 'pending_verification'
    },
    // Admin verification
    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    verifiedAt: {
        type: Date
    },
    rejectionReason: {
        type: String
    }
}, {
    timestamps: true
})

// indexes for querying
paymentSchema.index({ studentEmail: 1 })
paymentSchema.index({ tutorEmail: 1 })
paymentSchema.index({ applicationId: 1 })
paymentSchema.index({ status: 1 })
paymentSchema.index({ transactionId: 1 })

let Payment = mongoose.model('Payment', paymentSchema)

module.exports = Payment

