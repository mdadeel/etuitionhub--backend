
const express = require('express');
const router = express.Router();
const User = require('../models/User');

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
            // update  if user register with different role 
        if (role && role !== existing.role) {
            console.log('Updating role for', email, 'from', existing.role, 'to', role);
            existing.role = role;
            await existing.save();
 }
        return res.json(existing);
}

    const newUser = new User(req.body);
    await newUser.save();
    console.log('New user created:', email, 'role:', role);
        res.status(201).json(newUser);
} catch (error) {
    console.error('Error creating user:', error);
        res.status(500).json({ error: 'Server error' });
}
});

// update user by id
router.patch('/:id', async (req, res) => {
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

// delete user by id admin 
//add admin middleware
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
