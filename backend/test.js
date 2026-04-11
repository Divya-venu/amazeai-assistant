const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

async function test() {
    try {
        fs.writeFileSync('test.csv', 'revenue,expenses\n100,50\n200,100');
        const form = new FormData();
        form.append('file', fs.createReadStream('test.csv'));
        const response = await axios.post('http://localhost:5000/api/upload', form, {
            headers: form.getHeaders()
        });
        console.log('SUCCESS:', response.data);
    } catch (e) {
        console.log('ERROR STATUS:', e.response?.status);
        console.log('ERROR DATA:', e.response?.data);
        console.log('ERROR MESSAGE:', e.message);
    }
}
test();
