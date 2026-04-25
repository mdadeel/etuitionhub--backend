/**
 * One-time migration: normalize all user emails to lowercase.
 * Run with: node scripts/normalize-emails.js
 * 
 * This fixes the E11000 duplicate key error caused by the new
 * lowercase: true schema option on the email field.
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI not set in .env');
    process.exit(1);
}

async function normalizeEmails() {
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
    console.log('✅ Connected');

    const db = mongoose.connection.db;
    const users = db.collection('users');

    const allUsers = await users.find({}).toArray();
    console.log(`🔍 Found ${allUsers.length} users to check`);

    let updated = 0;
    let skipped = 0;
    let conflicts = 0;

    for (const user of allUsers) {
        const lower = user.email.toLowerCase();
        if (lower === user.email) {
            skipped++;
            continue;
        }

        // Check if a lowercase version already exists (would cause a conflict)
        const existing = await users.findOne({ email: lower, _id: { $ne: user._id } });
        if (existing) {
            console.warn(`⚠️  Conflict for "${user.email}" — lowercase version already exists (id: ${existing._id}). Deleting the mixed-case duplicate...`);
            await users.deleteOne({ _id: user._id });
            conflicts++;
            continue;
        }

        await users.updateOne({ _id: user._id }, { $set: { email: lower } });
        console.log(`  ✏️  Updated: "${user.email}" → "${lower}"`);
        updated++;
    }

    console.log('\n📊 Migration complete:');
    console.log(`   ✅ Updated: ${updated}`);
    console.log(`   ⏭️  Already lowercase: ${skipped}`);
    console.log(`   🗑️  Conflicts removed: ${conflicts}`);

    await mongoose.disconnect();
    console.log('🔌 Disconnected');
}

normalizeEmails().catch(err => {
    console.error('❌ Migration failed:', err);
    process.exit(1);
});
