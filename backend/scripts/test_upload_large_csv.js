const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

const API_URL = 'http://localhost:5000/api/upload-datasets';
const TEMP_CSV = path.join(__dirname, 'large_test.csv');
const ROW_COUNT = 130000;

async function generateLargeCSV() {
    console.log(`Generating ${ROW_COUNT} rows in ${TEMP_CSV}...`);
    const writeStream = fs.createWriteStream(TEMP_CSV);
    writeStream.write('Date,Product Name,Category,Price,Qty,Amount\n');
    
    for (let i = 0; i < ROW_COUNT; i++) {
        const date = '2024-01-01';
        const productName = `Product ${i % 100}`;
        const category = `Category ${i % 10}`;
        const price = 100 + (i % 50);
        const qty = 1 + (i % 5);
        const amount = price * qty;
        
        if (!writeStream.write(`${date},${productName},${category},${price},${qty},${amount}\n`)) {
            await new Promise(resolve => writeStream.once('drain', resolve));
        }
    }
    writeStream.end();
    return new Promise((resolve) => writeStream.on('finish', resolve));
}

async function uploadFile() {
    try {
        console.log('Uploading file...');
        const form = new FormData();
        form.append('files', fs.createReadStream(TEMP_CSV));

        const response = await axios.post(API_URL, form, {
            headers: {
                ...form.getHeaders(),
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        });

        console.log('Response:', response.data);
        if (response.data.success && response.data.count === ROW_COUNT) {
            console.log('SUCCESS: Large file uploaded and processed correctly!');
        } else {
            console.error('FAILURE: Unexpected response data', response.data);
        }
    } catch (error) {
        console.error('Upload Error:', error.response ? error.response.data : error.message);
    } finally {
        if (fs.existsSync(TEMP_CSV)) {
            fs.unlinkSync(TEMP_CSV);
        }
    }
}

async function run() {
    await generateLargeCSV();
    await uploadFile();
}

run();
