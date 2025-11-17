const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');

// GET all bookings (for admin or debug)
router.get('/', async (req, res) => {
    try {
        const bookings = await Booking.find().sort({ createdAt: -1 });
        res.json(bookings);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET bookings by student email
// used in StudentDashboard
router.get('/student/:email', async (req, res) => {
    try {
        const email = req.params.email;
        // console.log("Fetching bookings for:", email);
        const bookings = await Booking.find({ studentEmail: email }).sort({ createdAt: -1 });
        res.json(bookings);
    } catch (err) {
        console.error('Error fetching student bookings:', err);
        res.status(500).json({ error: 'Failed to fetch bookings' });
    }
});

// GET bookings by tutor email
// used in TutorDashboard (to be implemented)
router.get('/tutor/:email', async (req, res) => {
    try {
        const bookings = await Booking.find({ tutorEmail: req.params.email }).sort({ createdAt: -1 });
        res.json(bookings);
    } catch (err) {
        // console.log(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST create a new booking
router.post('/', async (req, res) => {
    try {
        const newBooking = new Booking(req.body);
        const saved = await newBooking.save();
        // console.log("New booking created:", saved._id);
        res.status(201).json(saved);
    } catch (err) {
        console.error("Booking error:", err);
        res.status(500).json({ error: 'Could not create booking' });
    }
});

// PATCH update booking status
router.patch('/:id', async (req, res) => {
    try {
        const { status, isAccepted } = req.body;
        const updated = await Booking.findByIdAndUpdate(
            req.params.id,
            { $set: { status, isAccepted } },
            { new: true }
        );
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: 'Update failed' });
    }
});

module.exports = router;
