// payment routes - manual payment system
// no stripe, admin verifies transaction IDs

const express = require('express')
const router = express.Router()
const Payment = require('../models/Payment')
const Application = require('../models/Application')
const Tuition = require('../models/Tuition')
const { authMiddleware, adminMiddleware } = require('../middleware/auth')
const asyncHandler = require('../utils/asyncHandler')
const { isValidObjectId } = require('../utils/validators')

// Submit manual payment - student submits transaction details
router.post('/manual', authMiddleware, asyncHandler(async (req, res) => {
    const {
        applicationId,
        studentEmail,
        tutorEmail,
        tutorName,
        amount,
        paymentMethod,
        transactionId,
        senderNumber,
        notes
    } = req.body

    // Validate required fields
    if (!applicationId || !transactionId || !senderNumber || !paymentMethod) {
        return res.status(400).json({ error: 'Missing required payment fields' })
    }

    if (!isValidObjectId(applicationId)) {
        return res.status(400).json({ error: 'Invalid application ID' })
    }

    // Check if application exists
    const app = await Application.findById(applicationId).populate('tuitionId')
    if (!app) {
        return res.status(404).json({ error: 'Application not found' })
    }

    // Check for duplicate transaction ID
    const existingPayment = await Payment.findOne({ transactionId: transactionId.trim() })
    if (existingPayment) {
        return res.status(400).json({ error: 'This transaction ID has already been submitted' })
    }

    // Create payment record
    const payment = new Payment({
        studentEmail: studentEmail || req.user.email,
        tutorEmail: tutorEmail || app.tutorEmail,
        tutorName: tutorName || app.tutorName,
        tutorId: app.tutorId,
        applicationId: applicationId,
        tuitionId: app.tuitionId?._id,
        amount: amount || app.expectedSalary,
        paymentMethod: paymentMethod,
        transactionId: transactionId.trim(),
        senderNumber: senderNumber.trim(),
        notes: notes?.trim() || '',
        status: 'pending_verification'
    })

    await payment.save()

    console.log('Manual payment submitted:', payment._id, 'TxnID:', transactionId)
    res.status(201).json(payment)
}))

// Get student payment history
router.get('/student/:email', authMiddleware, asyncHandler(async (req, res) => {
    const email = req.params.email

    // Only allow users to see their own payments (or admin)
    if (req.user.email !== email && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied' })
    }

    const payments = await Payment.find({ studentEmail: email })
        .populate('tutorId')
        .populate('tuitionId')
        .sort({ createdAt: -1 })

    res.json(payments)
}))

// Get tutor revenue history
router.get('/tutor/:email', authMiddleware, asyncHandler(async (req, res) => {
    const email = req.params.email

    // Only allow users to see their own revenue (or admin)
    if (req.user.email !== email && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied' })
    }

    const payments = await Payment.find({
        tutorEmail: email,
        status: 'verified'
    })
        .populate('tuitionId')
        .sort({ createdAt: -1 })

    res.json(payments)
}))

// Get ALL payments - admin only
router.get('/all', authMiddleware, adminMiddleware, asyncHandler(async (req, res) => {
    const payments = await Payment.find()
        .populate('tutorId')
        .populate('tuitionId')
        .sort({ createdAt: -1 })

    console.log('Admin fetching all payments:', payments.length)
    res.json(payments)
}))

// Update payment status - admin verify/reject
router.patch('/:id', authMiddleware, adminMiddleware, asyncHandler(async (req, res) => {
    const { id } = req.params
    const { status, rejectionReason } = req.body

    if (!isValidObjectId(id)) {
        return res.status(400).json({ error: 'Invalid payment ID' })
    }

    if (!['verified', 'rejected'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status. Must be verified or rejected' })
    }

    const updateData = {
        status: status,
        verifiedBy: req.user.id,
        verifiedAt: new Date()
    }

    if (status === 'rejected' && rejectionReason) {
        updateData.rejectionReason = rejectionReason
    }

    const payment = await Payment.findByIdAndUpdate(id, updateData, { new: true })

    if (!payment) {
        return res.status(404).json({ error: 'Payment not found' })
    }

    // If verified, update application status
    if (status === 'verified' && payment.applicationId) {
        await Application.findByIdAndUpdate(payment.applicationId, {
            status: 'approved',
            isPaid: true
        })

        // Update tuition status if exists
        if (payment.tuitionId) {
            await Tuition.findByIdAndUpdate(payment.tuitionId, {
                status: 'matched',
                assigned_tutor: payment.tutorId
            })
        }

        console.log('Payment verified, application approved:', payment.applicationId)
    }

    res.json(payment)
}))

// Get single payment by ID
router.get('/:id', authMiddleware, asyncHandler(async (req, res) => {
    const { id } = req.params

    if (!isValidObjectId(id)) {
        return res.status(400).json({ error: 'Invalid payment ID' })
    }

    const payment = await Payment.findById(id)
        .populate('tutorId')
        .populate('tuitionId')
        .populate('applicationId')

    if (!payment) {
        return res.status(404).json({ error: 'Payment not found' })
    }

    // Only allow involved parties or admin to view
    if (req.user.email !== payment.studentEmail &&
        req.user.email !== payment.tutorEmail &&
        req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied' })
    }

    res.json(payment)
}))

module.exports = router

