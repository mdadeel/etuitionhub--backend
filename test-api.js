const mongoose = require('mongoose');
const tuitionService = require('./services/tuitionService');

async function test() {
    try {
        await mongoose.connect('mongodb+srv://guluutub_db_user:N7IAOF6ZFHg59UOH@etuition.wrixhq2.mongodb.net/?appName=etuition');
        
        // Simulating express req.query from '?search=&classFilter=&locationFilter=&sortBy=newest&page=1&limit=8&status=approved'
        const reqQuery = {
            search: '',
            classFilter: '',
            locationFilter: '',
            sortBy: 'newest',
            page: '1',
            limit: '8',
            status: 'approved'
        };

        const filters = {
            status: reqQuery.status,
            search: reqQuery.search,
            classFilter: reqQuery.classFilter,
            locationFilter: reqQuery.locationFilter,
            sortBy: reqQuery.sortBy,
            page: reqQuery.page ? parseInt(reqQuery.page) : undefined,
            limit: reqQuery.limit ? parseInt(reqQuery.limit) : undefined,
            student_email: reqQuery.student_email
        };

        console.log('Filters passed to service:', filters);
        const resNew = await tuitionService.getAllTuitions(filters);
        console.log(`Result length: ${resNew.data ? resNew.data.length : 'No data.data'}`);

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

test();
