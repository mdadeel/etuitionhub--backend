const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');

// Special endpoint to initialize first admin (to be called securely)
// This would typically be a one-time setup or require some other authentication
// For now, this is just for development purposes and should be secured differently in production
router.post('/initialize-first-admin', async (req, res) => {
    try {
        const { email, displayName } = req.body;

        // Check if any admin already exists
        const existingAdmin = await User.findOne({ role: 'admin' });
        if (existingAdmin) {
            return res.status(400).json({ error: 'Admin already exists. Cannot create another.' });
        }

        // Check if user already exists
        const existing = await User.findOne({ email });
        if (existing) {
            // Update existing user to admin
            existing.role = 'admin';
            await existing.save();
            console.log('Converted user to admin:', email);
            return res.json(existing);
        }

        // Create new admin user
        const newAdmin = new User({
            email,
            displayName,
            role: 'admin'
        });

        await newAdmin.save();
        console.log('Admin user created:', email);
        res.status(201).json(newAdmin);
    } catch (error) {
        console.error('Error initializing admin:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Promote existing user to admin (requires auth, but admin role check happens after)
router.patch('/promote-to-admin/:userId', authMiddleware, async (req, res) => {
    try {
        // Check if current user is an admin (since we can't check role until after auth)
        // For this case, we'll need a more secure method

        // For now, use a hardcoded admin identifier that only the developer knows
        // This should be replaced with a secure admin verification system
        const ADMIN_API_KEY = process.env.ADMIN_API_KEY;
        const apiKey = req.headers['x-admin-key'];

        if (!ADMIN_API_KEY || apiKey !== ADMIN_API_KEY) {
            return res.status(403).json({ error: 'Unauthorized admin access' });
        }

        const { userId } = req.params;

        const user = await User.findByIdAndUpdate(
            userId,
            { role: 'admin' },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('Error promoting user to admin:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;