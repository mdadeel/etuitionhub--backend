
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

    // Verify user has tutor role
    const user = await User.findById(tutorId);
    if (!user || user.role !== 'tutor') {
        return res.status(403).json({ error: 'Only tutors can set availability' });
    }

    // Validate dayOfWeek (0-6)
    if (dayOfWeek === undefined || dayOfWeek < 0 || dayOfWeek > 6 || !Number.isInteger(dayOfWeek)) {
        return res.status(400).json({ error: 'dayOfWeek must be an integer between 0 and 6' });
    }

    // Validate slots structure
    if (!slots || !Array.isArray(slots)) {
        return res.status(400).json({ error: 'slots must be an array' });
    }

    for (const slot of slots) {
        if (!slot.startTime || !slot.endTime) {
            return res.status(400).json({ error: 'Each slot must have startTime and endTime' });
        }
    }

    // Upsert - create or update
    const availability = await Availability.findOneAndUpdate(
        { tutorId, dayOfWeek },
        { slots },
        { new: true, upsert: true }
    );

    res.status(201).json(availability);
}));

// Update availability
router.put('/availability/:day', authMiddleware, asyncHandler(async (req, res) => {
    const dayOfWeek = parseInt(req.params.day);
    const { slots } = req.body;
    const tutorId = req.user.userId;

    // Verify user has tutor role
    const user = await User.findById(tutorId);
    if (!user || user.role !== 'tutor') {
        return res.status(403).json({ error: 'Only tutors can update availability' });
    }

    // Validate dayOfWeek
    if (isNaN(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6) {
        return res.status(400).json({ error: 'dayOfWeek must be an integer between 0 and 6' });
    }

    // Validate slots
    if (!slots || !Array.isArray(slots)) {
        return res.status(400).json({ error: 'slots must be an array' });
    }

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

    // Verify user has tutor role
    const user = await User.findById(tutorId);
    if (!user || user.role !== 'tutor') {
        return res.status(403).json({ error: 'Only tutors can delete availability' });
    }

    // Validate dayOfWeek
    if (isNaN(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6) {
        return res.status(400).json({ error: 'dayOfWeek must be an integer between 0 and 6' });
    }

    const result = await Availability.findOneAndDelete({ tutorId, dayOfWeek });

    if (!result) {
        return res.status(404).json({ error: 'Availability not found' });
    }

    res.json({ message: 'Availability deleted' });
}));

module.exports = router;
