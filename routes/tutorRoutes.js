// Tutor routes - for getting tutors
const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Get all tutors (verified only by default)
router.get('/', async (req, res) => {
    try {
        const { limit, sort } = req.query;
        let query = User.find({ role: 'tutor' });

        if (sort === 'ratings') {
            query = query.sort({ ratings: -1 });
        }
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

module.exports = router;
