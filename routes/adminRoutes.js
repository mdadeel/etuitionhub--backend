const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authMiddleware, adminMiddleware } = require('../middleware/auth'); // Import adminMiddleware
const asyncHandler = require('../utils/asyncHandler'); // Import asyncHandler
const { isValidObjectId } = require('../utils/validators'); // Import isValidObjectId

// NOTE: The '/initialize-first-admin' endpoint is commented out.
// In a production environment, initial admin setup should be handled via a secure
// script (like seed-admin.js) or a dedicated, highly secured internal process,
// not an exposed API endpoint. This prevents unauthorized creation of admin accounts.
/*
router.post('/initialize-first-admin', asyncHandler(async (req, res) => {
    const { email, displayName } = req.body;

    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
        return res.status(400).json({ error: 'Admin already exists. Cannot create another.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        existingUser.role = 'admin';
        await existingUser.save();
        console.log('Converted user to admin:', email);
        return res.json(existingUser);
    }

    const newAdmin = new User({
        email,
        displayName,
        role: 'admin'
    });

    await newAdmin.save();
    console.log('Admin user created:', email);
    res.status(201).json(newAdmin);
}));
*/

/**
 * PATCH /api/admin/promote-to-admin/:userId
 * Promotes an existing user to admin role.
 * Requires authentication and authorization as an admin.
 * @param {string} userId - The ID of the user to promote.
 */
router.patch('/promote-to-admin/:userId', authMiddleware, adminMiddleware, asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
        return res.status(400).json({ error: 'Invalid user ID format' });
    }

    const user = await User.findByIdAndUpdate(
        userId,
        { role: 'admin' },
        { new: true, runValidators: true }
    );

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
}));

module.exports = router;
