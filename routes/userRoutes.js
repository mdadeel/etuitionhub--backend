// User routes for e-tuitionBD
// Handles user CRUD operations
// FIXME: add proper validation middleware later
const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Get all users (admin only - TODO: add auth middleware)
router.get('/', async function (req, res) {
    try {
        // console.log('fetching all users');
        const users = await User.find();
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get user by email - used often
// NOTE: this returns the full user object, might want to filter some fields
router.get('/:email', async (req, res) => {
    try {
        // console.log('fetching user:', req.params.email);
        const user = await User.findOne({ email: req.params.email });
        if (!user) {
            // User not found - maybe show different message
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create/Update user - recieve user data
// This is called when user logs in with Firebase
router.post('/', async function (req, res) {
    try {
        const { email } = req.body;
        // console.log('creating/updating user:', email);

        // Check if user exists - simple approach
        const existing = await User.findOne({ email });
        if (existing) {
            // console.log('user already exists');
            return res.json(existing); // Already exists, return existing
        }

        const newUser = new User(req.body);
        await newUser.save();
        // console.log('new user created:', newUser._id);
        res.status(201).json(newUser);
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update user by id - not fully tested
router.patch('/:id', async (req, res) => {
    try {
        // console.log('updating user:', req.params.id);
        const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) {
            // NOTE: should we return 404 here?
            return res.status(404).json({ error: 'User not found' })
        }
        res.json(updated);
    } catch (error) {
        // Missing proper error handling here - will fix later
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete user by id - admin only
// TODO: add admin middleware
router.delete('/:id', async (req, res) => {
    try {
        // console.log('deleting user:', req.params.id);
        const deleted = await User.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ error: 'User not found' })
        }
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
