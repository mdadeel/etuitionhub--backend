// Seed admin user script
// Run with: node scripts/seed-admin.js

const mongoose = require('mongoose');
require('dotenv').config();

// Import User model
const User = require('../models/User');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/etuitionbd';

async function seedAdmin() {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Try to drop the stale username index if it exists
        try {
            await mongoose.connection.collection('users').dropIndex('username_1');
            console.log('✅ Dropped stale username index');
        } catch (e) {
            // Index might not exist, that's fine
            console.log('ℹ️ No username index to drop (or already dropped)');
        }

        // Admin user data
        const adminData = {
            displayName: 'Admin User',
            email: 'admin@etuition.com',
            role: 'admin',
            isVerified: true,
            photoURL: ''
        };

        // Demo Admin user data (for testing)
        const demoAdminData = {
            displayName: 'Demo Admin',
            email: 'demoadmin@etuition.com',
            role: 'admin',
            isVerified: true,
            photoURL: ''
        };

        // Use findOneAndUpdate with upsert to avoid duplicate issues
        const admin = await User.findOneAndUpdate(
            { email: adminData.email },
            { $set: adminData },
            { upsert: true, new: true }
        );

        const demoAdmin = await User.findOneAndUpdate(
            { email: demoAdminData.email },
            { $set: demoAdminData },
            { upsert: true, new: true }
        );

        console.log('✅ Admin user created/updated:', admin.email);
        console.log('✅ Demo Admin user created/updated:', demoAdmin.email);

        console.log('\n📋 Admin Credentials:');
        console.log('   Email: admin@etuition.com');
        console.log('   Password: (Set via Firebase - register with this email first)');
        console.log('\n📋 Demo Admin Credentials:');
        console.log('   Email: demoadmin@etuition.com');
        console.log('   Password: password123');
        console.log('\n💡 To use admin account:');
        console.log('   1. Go to /register and create account with email: admin@etuition.com');
        console.log('   2. Login with your password');
        console.log('   3. You will be redirected to Admin Dashboard');
        console.log('\n💡 For Demo Admin:');
        console.log('   1. Make sure demoadmin@etuition.com is registered in Firebase');
        console.log('   2. Use the "Demo Admin" button on the Admin Login page');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding admin:', error);
        process.exit(1);
    }
}

// Run the seed
seedAdmin();
