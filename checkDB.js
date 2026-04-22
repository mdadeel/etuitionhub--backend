const mongoose = require('mongoose');

async function run() {
    try {
        await mongoose.connect('mongodb+srv://guluutub_db_user:N7IAOF6ZFHg59UOH@etuition.wrixhq2.mongodb.net/?appName=etuition');
        const db = mongoose.connection.db;
        
        const approvedTuitions = await db.collection('tuitions').find({ status: 'approved' }).toArray();
        console.log(`Approved Tuitions: ${approvedTuitions.length}`);
        console.log(approvedTuitions.map(t => ({ id: t._id, subject: t.subject })));

    } catch (e) {
        console.error('Error connecting to DB:', e.message);
    } finally {
        await mongoose.disconnect();
    }
}

run();
