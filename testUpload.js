const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function testUpload() {
    const formData = new FormData();
    // create a dummy csv in memory
    const csvContent = "product,sales,revenue\\nApple,10,100\\nBanana,20,50";
    formData.append('file', Buffer.from(csvContent), { filename: 'test.csv', contentType: 'text/csv' });

    try {
        const response = await axios.post('http://localhost:5000/api/analyze', formData, {
            headers: formData.getHeaders()
        });
        console.log("Success:", response.data);
    } catch (error) {
        console.error("Error:", error.response ? error.response.data : error.message);
    }
}

testUpload();
