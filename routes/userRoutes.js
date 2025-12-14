
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Get all users
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

// Get user  email 
router.get('/:email', async (req, res) => {
    try {
        // console.log('fetching user:', req.params.email);
        const user = await User.findOne({ email: req.params.email });
        if (!user) {
            // User not found 
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create/Update user 
// calle when user login with Firebase
router.post('/', async function (req, res) {
    try {
        const { email, role } = req.body;

        // Check if user exists
        const existing = await User.findOne({ email });
        if (existing) {
            // Login successful
            return res.json(existing);
        }

        // Prevent creating admin users directly
        let userRole = role;
        if (userRole === 'admin') {
            userRole = 'student'; // Force downgrade if trying to be admin
        }

        const newUser = new User({
            ...req.body,
            role: userRole
        });

        await newUser.save();
        console.log('New user created:', email, 'role:', userRole);
        res.status(201).json(newUser);
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// update user by id - Protected
router.patch('/:id', authMiddleware, async (req, res) => {
    try {
        // console.log('updating user:', req.params.id);
        const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) {

            return res.status(404).json({ error: 'User not found' })
        }
        res.json(updated);
    } catch (error) {
        // Missing proper error handling here - will fix later
        res.status(500).json({ error: 'Server error' });
    }
});

// delete user by id admin - Protected
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
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
