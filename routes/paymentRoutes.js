
const express = require('express')
const router = express.Router()
const Payment = require('../models/Payment')
const Application = require('../models/Application')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

// create checkout session
router.post('/create-checkout-session', async (req, res) => {
    try {
        let { applicationId, studentEmail, amount } = req.body

        // application details anbo
        let app = await Application.findById(applicationId).populate('tuitionId')

        if (!app) {
            return res.status(404).json({ error: 'Application not found' })
        }

        console.log('creating checkout for app:', applicationId)

        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'bdt',
                        product_data: {
                            name: `Tuition: ${app.tuitionId?.subject || 'Subject'}`,
                            description: `Payment to tutor ${app.tutorName}`
                        },
                        unit_amount: amount * 100 // stripe uses cents/paisa
                    },
                    quantity: 1
                }
            ],
            mode: 'payment',
            success_url: `${process.env.CLIENT_URL || 'http://localhost:5174'}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL || 'http://localhost:5174'}/dashboard`,
            metadata: {
                applicationId: applicationId.toString(),
                studentEmail: studentEmail,
                tutorEmail: app.tutorEmail,
                tutorId: app.tutorId.toString(),
                tuitionId: app.tuitionId._id.toString()
            }
        })

        // payment record create
        let payment = new Payment({
            studentId: app.tuitionId.studentId || null,
            studentEmail: studentEmail,
            tutorId: app.tutorId,
            tutorEmail: app.tutorEmail,
            applicationId: applicationId,
            tuitionId: app.tuitionId._id,
            amount: amount,
            stripeSessionId: session.id,
            status: 'pending'
        })

        await payment.save()

        console.log('payment record created:', payment._id)
        res.json({ sessionId: session.id, url: session.url })

    } catch (error) {
        console.error('checkout error:', error)
        res.status(500).json({ error: error.message })
    }
})

// get student payment history
router.get('/student/:email', async (req, res) => {
    try {
        let email = req.params.email

        // student er sob payments
        let payments = await Payment.find({ studentEmail: email })
            .populate('tutorId')
            .populate('tuitionId')
            .sort({ createdAt: -1 })

        console.log('found payments:', payments.length) // debug
        res.json(payments)
    } catch (err) {
        console.error('get payments error:', err)
        res.status(500).json({ error: 'failed to get payments' })
    }
})

// get ALL payments - for admin dashboard
router.get('/all', async (req, res) => {
    try {
        let payments = await Payment.find()
            .populate('tutorId')
            .populate('tuitionId')
            .sort({ createdAt: -1 })

        console.log('admin fetching all payments:', payments.length)
        res.json(payments)
    } catch (err) {
        console.error('get all payments error:', err)
        res.status(500).json({ error: 'failed to get payments' })
    }
})

// get tutor revenue history
router.get('/tutor/:email', async (req, res) => {
    try {
        let email = req.params.email

        let payments = await Payment.find({
            tutorEmail: email,
            status: 'completed'
        })
            .populate('studentId')
            .populate('tuitionId')
            .sort({ createdAt: -1 })



        res.json(payments)
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'failed to get revenue' })
    }
})

// stripe webhook - payment success handle korbe
// TODO: add webhook signature verification for security - bhaiya suggested
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    try {
        let event = req.body

        console.log('webhook event:', event.type)

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object

            // payment status update korbo
            await Payment.findOneAndUpdate(
                { stripeSessionId: session.id },
                { status: 'completed' }
            )

            // application status o approved e update korbo
            await Application.findByIdAndUpdate(
                session.metadata.applicationId,
                { status: 'approved' }
            )

            console.log('payment completed for app:', session.metadata.applicationId)
        }

        res.json({ received: true })
    } catch (error) {
        console.error('webhook error:', error)
        res.status(500).json({ error: 'webhook failed' })
    }
})

module.exports = router
