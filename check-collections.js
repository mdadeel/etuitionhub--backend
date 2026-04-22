const mongoose = require('mongoose');

async function check() {
    try {
        await mongoose.connect('mongodb+srv://guluutub_db_user:N7IAOF6ZFHg59UOH@etuition.wrixhq2.mongodb.net/?appName=etuition');
        
        const dbTest = mongoose.connection.useDb('test');
        const testCols = await dbTest.listCollections().toArray();
        console.log('Collections in "test":', testCols.map(c => c.name));
        
        for (const col of testCols) {
            const count = await dbTest.collection(col.name).countDocuments();
            console.log(` - ${col.name}: ${count}`);
        }

        const dbEtuition = mongoose.connection.useDb('etuition');
        const etuitionCols = await dbEtuition.listCollections().toArray();
        console.log('\nCollections in "etuition":', etuitionCols.map(c => c.name));
        
        for (const col of etuitionCols) {
            const count = await dbEtuition.collection(col.name).countDocuments();
            console.log(` - ${col.name}: ${count}`);
        }

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

check();
