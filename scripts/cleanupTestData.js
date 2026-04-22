/**
 * Cleanup Test Data Script
 * 
 * Safely removes test/mock tuitions from the database.
 * Targets records with "Test Subject" in their subject line.
 */
const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });

const Tuition = require('../models/Tuition');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI is not set in environment variables');
    process.exit(1);
}

async function cleanup() {
    try {
        console.log('📡 Connecting to MongoDB for cleanup...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected successfully');

        // Define criteria for test data
        const testCriteria = {
            $or: [
                { subject: /Test Subject/i },
                { subject: /demo/i },
                { location: /Test Location/i }
            ]
        };

        // First, find and log the items to be deleted
        const itemsToDelete = await Tuition.find(testCriteria);
        
        if (itemsToDelete.length === 0) {
            console.log('✨ No test data found. Database is clean.');
            return;
        }

        console.log(`🔍 Found ${itemsToDelete.length} items matching test criteria:`);
        itemsToDelete.forEach(item => {
            console.log(`   - [${item._id}] ${item.subject} (${item.location})`);
        });

        // Perform deletion
        const result = await Tuition.deleteMany(testCriteria);
        console.log(`\n✅ Successfully deleted ${result.deletedCount} test records.`);

    } catch (error) {
        console.error('❌ Cleanup failed:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('📡 Disconnected from MongoDB');
    }
}

// Run the script
cleanup();
