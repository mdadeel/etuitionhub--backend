const mongoose = require('mongoose');

async function check() {
    try {
        await mongoose.connect('mongodb+srv://guluutub_db_user:N7IAOF6ZFHg59UOH@etuition.wrixhq2.mongodb.net/?appName=etuition');
        const dbTest = mongoose.connection.useDb('test');
        const countTest = await dbTest.collection('tuitions').countDocuments();
        
        const dbEtuition = mongoose.connection.useDb('etuition');
        const countEtuition = await dbEtuition.collection('tuitions').countDocuments();
        
        console.log('Tuitions in "test" DB:', countTest);
        console.log('Tuitions in "etuition" DB:', countEtuition);
    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

check();
