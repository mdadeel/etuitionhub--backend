const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Get all users
router.get('/', async function (req, res) {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get user by email
router.get('/:email', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.params.email });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create or update user (Firebase Login)
router.post('/', async function (req, res) {
    try {
        const { email, role, displayName, photoURL, mobileNumber } = req.body;

        // Check if user exists
        const existing = await User.findOne({ email });

        if (existing) {
            // Update role if it's different (e.g. Upgrade to Tutor)
            if (existing.role !== role) {
                if (existing.role === 'student' && role === 'tutor') {
                    existing.role = 'tutor';
                    await existing.save();
                    const updatedUser = await User.findOne({ email });
                    return res.json(updatedUser);
                }
            }
            return res.json(existing);
        }

        // New User Creation
        let userRole = role;
        if (role === 'admin') {
            // Prevent direct admin registration
            userRole = 'student';
        }

        const newUser = new User({
            email,
            displayName,
            photoURL: photoURL || '',
            mobileNumber: mobileNumber || '',
            role: userRole
        });

        await newUser.save();
        res.status(201).json(newUser);
    } catch (error) {
        console.error('Error creating/updating user:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update user by ID
router.patch('/:id', authMiddleware, async (req, res) => {
    try {
        const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) {
            return res.status(404).json({ error: 'User not found' })
        }
        res.json(updated);
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete user by ID (Admin only)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
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
