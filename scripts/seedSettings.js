/**
 * Seed Settings Script
 * Initializes default site configurations
 */
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const Setting = require('../models/Setting');

const MONGODB_URI = process.env.MONGODB_URI;

const defaultSettings = [
    {
        key: 'contact_phone',
        value: '+880 1700-000000',
        label: 'Support Hotline',
        category: 'contact',
        description: 'Primary contact number shown in footer and contact page.'
    },
    {
        key: 'contact_email',
        value: 'support@etuitionhub.com',
        label: 'Support Email',
        category: 'contact',
        description: 'Official support email address.'
    },
    {
        key: 'platform_fee',
        value: 10,
        label: 'Platform Fee (%)',
        category: 'financial',
        description: 'Percentage taken from tutor payments.'
    },
    {
        key: 'notice_banner',
        value: 'Welcome to e-tuitionBD. Secure your academic future with our verified specialists!',
        label: 'Notice Banner Text',
        category: 'general',
        description: 'Announcement text shown at the top of the homepage.'
    }
];

async function seed() {
    try {
        if (!MONGODB_URI) throw new Error('MONGODB_URI not found');
        
        await mongoose.connect(MONGODB_URI);
        console.log('📡 Connected to MongoDB');

        for (const setting of defaultSettings) {
            await Setting.findOneAndUpdate(
                { key: setting.key },
                setting,
                { upsert: true, new: true }
            );
            console.log(`✅ Seeded/Updated: ${setting.key}`);
        }

        console.log('\n✨ Settings initialization complete.');
    } catch (error) {
        console.error('❌ Seeding failed:', error.message);
    } finally {
        await mongoose.disconnect();
    }
}

seed();
