const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testHeatmapUpload() {
    const baseURL = 'http://localhost:5000/api';
    const csvPath = path.join(__dirname, 'sample_global_sales.csv');
    
    console.log('--- Step 1: Uploading Sample CSV ---');
    try {
        const form = new FormData();
        form.append('file', fs.createReadStream(csvPath));
        
        const uploadRes = await axios.post(`${baseURL}/upload`, form, {
            headers: form.getHeaders(),
        });
        
        console.log('Upload Status:', uploadRes.status);
        console.log('Records Processed:', uploadRes.data.count);
        
        console.log('\n--- Step 2: Verifying Global Sales API ---');
        const salesRes = await axios.get(`${baseURL}/global-sales`);
        console.log('Global Sales Result:', JSON.stringify(salesRes.data, null, 2));
        
        // Verify specific countries
        const expectedCountries = ['USA', 'India', 'UK', 'Germany', 'Canada', 'Australia', 'France', 'Japan', 'Brazil', 'China', 'Russia', 'Mexico', 'Argentina', 'UAE'];
        const foundCountries = Object.keys(salesRes.data);
        
        const missing = expectedCountries.filter(c => !foundCountries.includes(c));
        
        if (missing.length === 0) {
            console.log('\n✅ Success: All expected countries found in global sales data.');
        } else {
            console.log('\n❌ Failure: Missing countries:', missing.join(', '));
            console.log('Actually found:', foundCountries.join(', '));
        }
        
    } catch (error) {
        console.error('❌ Error during verification:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
    }
}

testHeatmapUpload();
