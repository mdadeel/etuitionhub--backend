const axios = require('axios');

async function testAPI() {
    try {
        const res = await axios.get('http://localhost:5000/api/tuitions', {
            params: { status: 'approved', limit: 8 }
        });
        console.log('Status:', res.status);
        console.log('Result type:', typeof res.data);
        if (res.data.data) {
            console.log('Count:', res.data.data.length);
            console.log('Items:', res.data.data.map(t => t.subject));
        } else {
            console.log('Count (array):', res.data.length);
        }
    } catch (err) {
        console.error('API Error:', err.message);
        if (err.response) console.log('Response:', err.response.data);
    }
}

testAPI();
