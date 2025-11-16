// payment model - store payment records
// student pays tutor when approving application
const mongoose = require('mongoose')

const paymentSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    studentEmail: {
        type: String,
        required: true
    },
    tutorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    tutorEmail: {
        type: String,
        required: true
    },
    applicationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Application",
        required: true
    },
    tuitionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tuition',
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 1000 // minimum payment 1000 tk
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: "pending"
    },
    // stripe details
    stripeSessionId: {
        type: String,
        required: true
    },
    paymentMethod: {
        type: String,
        default: 'stripe'
    }
}, {
    timestamps: true // createdAt, updatedAt auto
})

// index for querying
paymentSchema.index({ studentEmail: 1 })
paymentSchema.index({ tutorEmail: 1 })
paymentSchema.index({ applicationId: 1 })

let Payment = mongoose.model('Payment', paymentSchema)

module.exports = Payment
