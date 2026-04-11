const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

const API_URL = 'http://localhost:5000/api';

async function runTest() {
    try {
        console.log('--- Starting End-to-End AI Insights Test ---');
        console.log(`Target API: ${API_URL}`);

        // 0. Check if server is alive
        try {
            await axios.get(`${API_URL.replace('/api', '')}/health`);
            console.log('0. Server is alive.');
        } catch (e) {
            console.error('0. Server is NOT reachable at', API_URL);
            return;
        }

        // 1. Create a dummy CSV file
        const csvContent = 'Date,Product Name,Category,Price,Quantity,Cost Price\n2026-03-01,Product A,Electronics,100,2,70\n2026-03-02,Product B,Fashion,50,5,30';
        const csvPath = path.join(__dirname, 'test_sales.csv');
        fs.writeFileSync(csvPath, csvContent);
        console.log('1. Created dummy CSV file.');

        // 2. Upload the CSV file
        console.log('2. Uploading CSV to /api/upload-datasets...');
        const formData = new FormData();
        formData.append('files', fs.createReadStream(csvPath));

        const uploadRes = await axios.post(`${API_URL}/upload-datasets`, formData, {
            headers: formData.getHeaders()
        });
        console.log('Upload Result:', uploadRes.data);

        // 3. Generate Insights
        console.log('3. Requesting AI Insights from /api/insights...');
        // We send an empty dataset to force the backend to fetch from DB
        const insightsRes = await axios.post(`${API_URL}/insights`, { dataset: [] });
        console.log('AI Insights Result:', JSON.stringify(insightsRes.data, null, 2));

        if (insightsRes.data.report && insightsRes.data.recommendations) {
            console.log('\n✅ TEST PASSED: AI Insights generated successfully!');
        } else {
            console.log('\n❌ TEST FAILED: Response structure invalid.');
        }

        // Cleanup
        fs.unlinkSync(csvPath);

    } catch (error) {
        if (error.response) {
            console.error('\n❌ TEST FAILED with Server Error:', error.response.status, error.response.data);
        } else if (error.request) {
            console.error('\n❌ TEST FAILED: No response received from server. Is it running?');
        } else {
            console.error('\n❌ TEST FAILED with error:', error.message);
        }
    }
}

runTest();
