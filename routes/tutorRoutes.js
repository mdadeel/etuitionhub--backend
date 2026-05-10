
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Availability = require('../models/Availability');
const Booking = require('../models/Booking');
const { authMiddleware } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

// get all tutrs with filters
router.get('/', async (req, res) => {
    try {
        const { limit, sort, subject, minPrice, maxPrice, q } = req.query;
        let queryObj = { role: 'tutor' };

        if (q) {
            queryObj.displayName = { $regex: q, $options: 'i' };
        }

        if (subject && subject !== 'All') {
            queryObj.subjects = subject;
        }

        if (minPrice || maxPrice) {
            queryObj.expectedSalary = {};
            if (minPrice) queryObj.expectedSalary.$gte = parseInt(minPrice);
            if (maxPrice) queryObj.expectedSalary.$lte = parseInt(maxPrice);
        }

        let query = User.find(queryObj);

        if (sort === 'ratings') query = query.sort({ ratings: -1 });
        if (sort === 'salary-low') query = query.sort({ expectedSalary: 1 });
        
        if (limit) {
            query = query.limit(parseInt(limit));
        }

        const tutors = await query;
        res.json(tutors);
    } catch (error) {
        console.error('Error fetching tutors:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get tutor availability
router.get('/:id/availability', async (req, res) => {
    try {
        const tutorId = req.params.id;
        const availability = await Availability.find({ tutorId });
        
        // In a real implementation, we would also fetch bookings for the requested month 
        // and filter out booked slots. For now, we return base availability.
        
        res.json(availability);
    } catch (error) {
        console.error('Error fetching availability:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get single tutor by id
router.get('/:id', async (req, res) => {
    try {
        const tutor = await User.findById(req.params.id);
        if (!tutor || tutor.role !== 'tutor') {
            return res.status(404).json({ error: 'Tutor not found' });
        }
        res.json(tutor);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create availability - tutor sets their weekly schedule
router.post('/availability', authMiddleware, asyncHandler(async (req, res) => {
    const { dayOfWeek, slots } = req.body;
    const tutorId = req.user.userId;

    // Check if availability for this day already exists
    let availability = await Availability.findOne({ tutorId, dayOfWeek });

    if (availability) {
        // Update existing
        availability.slots = slots;
        await availability.save();
        return res.json(availability);
    }

    // Create new
    availability = new Availability({ tutorId, dayOfWeek, slots });
    await availability.save();
    res.status(201).json(availability);
}));

// Update availability
router.put('/availability/:day', authMiddleware, asyncHandler(async (req, res) => {
    const dayOfWeek = parseInt(req.params.day);
    const { slots } = req.body;
    const tutorId = req.user.userId;

    const availability = await Availability.findOneAndUpdate(
        { tutorId, dayOfWeek },
        { slots },
        { new: true, upsert: true }
    );

    res.json(availability);
}));

// Delete availability for a day
router.delete('/availability/:day', authMiddleware, asyncHandler(async (req, res) => {
    const dayOfWeek = parseInt(req.params.day);
    const tutorId = req.user.userId;

    await Availability.findOneAndDelete({ tutorId, dayOfWeek });
    res.json({ message: 'Availability deleted' });
}));

module.exports = router;
