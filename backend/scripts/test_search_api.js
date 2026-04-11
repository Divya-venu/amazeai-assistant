const axios = require('axios');

async function testSearch() {
    const baseURL = 'http://localhost:5000/api';
    const query = 'Shirt';
    
    console.log(`Testing search for: "${query}"...`);
    
    try {
        // Test /api/search?q=...
        const resSearch = await axios.get(`${baseURL}/search?q=${query}`);
        console.log('--- /api/search?q=... ---');
        console.log('Status:', resSearch.status);
        console.log('Summary Result:', resSearch.data.summary);
        console.log('First 3 monthly breakdown items:', resSearch.data.monthlyBreakdown.slice(0, 3));
        
        // Test /api/summary?search=... (legacy support check)
        const resSummary = await axios.get(`${baseURL}/summary?search=${query}`);
        console.log('\n--- /api/summary?search=... ---');
        console.log('Summary Result:', resSummary.data.summary);

        if (JSON.stringify(resSearch.data.summary) === JSON.stringify(resSummary.data.summary)) {
            console.log('\n✅ Success: Both endpoints return identical summary data.');
        } else {
            console.log('\n❌ Failure: Endpoints return different data.');
        }

    } catch (error) {
        console.error('❌ Error during verification:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
    }
}

testSearch();
