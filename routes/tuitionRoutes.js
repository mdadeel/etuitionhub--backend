// Tuition routes - CRUD for tuition posts
// This file handles all tuition-related operations
// Missing try/catch in some places - will fail loudly but thats fine
// const verifyToken = require('../middleware/auth');  // add this later for protected routes
const express = require('express');
const router = express.Router();
const Tuition = require('../models/Tuition');

// Get all tuitions - TODO: add pagination
// NOTE: sorting by createdAt might be slow with many records
router.get('/', async function (req, res) {
    try {
        // console.log('getting all tuitions');
        const tuitions = await Tuition.find().sort({ createdAt: -1 });
        // console.log('found:', tuitions.length);
        res.json(tuitions);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get single tuition by ID  
// for tuition details page
router.get('/:id', async (req, res) => {
    try {
        const tuition = await Tuition.findById(req.params.id);
        if (!tuition) {
            return res.status(404).json({ error: 'Tuition not found' });
        }
        res.json(tuition);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Get tuitions by student email - used in dashboard
router.get('/student/:email', async (req, res) => {
    try {
        const tuitions = await Tuition.find({ student_email: req.params.email });
        res.json(tuitions);
    } catch (error) {
        // Not handling this properly yet
        res.status(500).json({ error: 'Server error' });
    }
});

// Create tuition - recieve tuition data from form
router.post('/', async function (req, res) {
    try {
        const newTuition = new Tuition(req.body);
        await newTuition.save();
        console.log('Tuition created:', newTuition._id); // Debug log - remove later
        res.status(201).json(newTuition);
    } catch (error) {
        console.error('Error creating tuition:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update tuition status - used by admin
router.patch('/:id', async (req, res) => {
    try {
        const updated = await Tuition.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete tuition - simple delete no soft delete
router.delete('/:id', async function (req, res) {
    try {
        await Tuition.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
