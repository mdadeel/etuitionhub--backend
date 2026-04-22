const http = require('http');

const url = 'http://localhost:5000/api/tuitions?status=approved&limit=8';

http.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        console.log('Status:', res.statusCode);
        try {
            const json = JSON.parse(data);
            if (json.data) {
                console.log('Count:', json.data.length);
                console.log('Items:', json.data.map(t => t.subject));
            } else {
                console.log('Count (array):', json.length);
            }
        } catch (e) {
            console.log('Error parsing JSON:', e.message);
            console.log('Raw data snippet:', data.substring(0, 100));
        }
    });
}).on('error', (err) => {
    console.error('Request Error:', err.message);
});
