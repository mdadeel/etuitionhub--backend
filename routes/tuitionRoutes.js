const express = require('express');
const router = express.Router();
const Tuition = require('../models/Tuition');
const mongoose = require('mongoose');
const { authMiddleware } = require('../middleware/auth');

// check valid Objectid
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Get all tuitions
router.get('/', async (req, res) => {
    // console.log('hit tuitions endpoint')  // debug log
    try {
        const title = req.query.title;
        // console.log('found tuitions:', tuition_data.length)
        const tuition_data = await Tuition.find().sort({ createdAt: -1 });
        res.json(tuition_data);
    } catch (error) {
        console.log('error getting tuitions', error);
        res.status(500).json({ error: 'failed to get tuitions' });
    }
});

//  single tuition 
router.get('/:id', async (req, res) => {
    let tuition_id = req.params.id;

    // Validate Objectid 
    if (!isValidObjectId(tuition_id)) {
        return res.status(400).json({ error: 'Invalid tuition ID format' });
    }

    try {
        const tuition_data = await Tuition.findById(tuition_id);
        if (!tuition_data) {
            return res.status(404).json({ error: 'not found' });
        }
        res.json(tuition_data);
    } catch (err) {
        console.log('error', err);
        res.status(500).json({ error: 'server error' });
    }
});

// Get by student email
router.get('/student/:email', async (req, res) => {
    let student_email = req.params.email;

    try {
        const data = await Tuition.find({ student_email: student_email });
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'error' });
    }
});

// Create tuition - Protected
router.post('/', authMiddleware, async (req, res) => {
    let { subject, class_name, location, salary, student_email } = req.body;

    // validate inline 
    if (!subject) return res.status(400).json({ error: 'subject required' });
    if (!class_name) return res.status(400).json({ error: 'class required' });
    if (!location) return res.status(400).json({ error: 'location required' });

    try {
        const new_tuition = await Tuition.create({
            subject: subject,
            class_name: class_name,
            location: location,
            salary: salary,
            student_email: student_email
        });
        console.log('created tuition:', new_tuition._id);
        res.status(201).json(new_tuition);
    } catch (e) {
        console.log('create error', e);
        res.status(500).json({ error: e.message });
    }
});

// Update tuition - Protected
router.patch('/:id', authMiddleware, async (req, res) => {
    if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ error: 'Invalid tuition ID format' });
    }
    try {
        const updated = await Tuition.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: 'update failed' });
    }
});

// Delete tuition - Protected
router.delete('/:id', authMiddleware, async (req, res) => {
    if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ error: 'Invalid tuition ID format' });
    }
    try {
        await Tuition.findByIdAndDelete(req.params.id);
        res.json({ message: 'deleted' });
    } catch (err) {
        res.status(500).json({ error: 'delete failed' });
    }
});

module.exports = router;
