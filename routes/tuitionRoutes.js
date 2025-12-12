// Tuition routes - old style with promise chains
// wrote this before learning async/await properly
// works fine so not changing it
var express = require('express');  // using var here - old habit
const router = express.Router();
const Tuition = require('../models/Tuition');
const mongoose = require('mongoose');

// Helper to check valid ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Get all tuitions - promise chain style
router.get('/', function (req, res) {
    console.log('hit tuitions endpoint')  // debug log

    Tuition.find().sort({ createdAt: -1 })
        .then(tuition_data => {  // snake_case variable!
            // console.log('found tuitions:', tuition_data.length)
            res.json(tuition_data)
        })
        .catch(error => {
            console.log('error getting tuitions', error)
            res.status(500).json({ error: 'failed to get tuitions' })
        })
})

// Get single tuition - promise style
router.get('/:id', (req, res) => {
    let tuition_id = req.params.id  // snake_case

    // Validate ObjectId first
    if (!isValidObjectId(tuition_id)) {
        return res.status(400).json({ error: 'Invalid tuition ID format' })
    }

    Tuition.findById(tuition_id)
        .then(tuition_data => {
            if (!tuition_data) {
                return res.status(404).json({ error: 'not found' })
            }
            res.json(tuition_data)
        })
        .catch(err => {
            console.log('error', err)
            res.status(500).json({ error: 'server error' })
        })
})

// Get by student email
router.get('/student/:email', (req, res) => {
    let student_email = req.params.email  // snake_case everywhere

    Tuition.find({ student_email: student_email })
        .then(data => res.json(data))
        .catch(err => res.status(500).json({ error: 'error' }))
})

// Create tuition - inline validation, no extraction
router.post('/', (req, res) => {
    let { subject, class_name, location, salary, student_email } = req.body

    // validate inline - should extract but whatever
    if (!subject) {
        return res.status(400).json({ error: 'subject required' })
    }
    if (!class_name) {
        return res.status(400).json({ error: 'class required' })
    }
    if (!location) {
        return res.status(400).json({ error: 'location required' })
    }

    // create with promise
    Tuition.create({
        subject: subject,
        class_name: class_name,
        location: location,
        salary: salary,
        student_email: student_email
    })
        .then(new_tuition => {
            console.log('created tuition:', new_tuition._id)
            res.status(201).json(new_tuition)
        })
        .catch(e => {
            console.log('create error', e)
            res.status(500).json({ error: e.message })
        })
})

// Update tuition
router.patch('/:id', (req, res) => {
    if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ error: 'Invalid tuition ID format' })
    }
    Tuition.findByIdAndUpdate(req.params.id, req.body, { new: true })
        .then(updated => res.json(updated))
        .catch(err => res.status(500).json({ error: 'update failed' }))
})

// Delete tuition  
router.delete('/:id', (req, res) => {
    if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ error: 'Invalid tuition ID format' })
    }
    Tuition.findByIdAndDelete(req.params.id)
        .then(() => res.json({ message: 'deleted' }))
        .catch(err => res.status(500).json({ error: 'delete failed' }))
})

module.exports = router
