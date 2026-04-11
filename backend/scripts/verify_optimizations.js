const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function verify() {
    console.log('--- Verifying Optimizations & Bug Fixes ---');

    try {
        // 1. Verify Sales Summary (Aggregation)
        console.log('\n[1] Verifying Sales Summary (Aggregation)...');
        const summaryRes = await axios.get(`${API_BASE}/sales/summary`);
        console.log('Summary Response:', JSON.stringify(summaryRes.data.summary, null, 2));
        if (summaryRes.data.summary && summaryRes.data.monthlyBreakdown) {
            console.log('SUCCESS: Aggregation working correctly.');
        } else {
            console.error('FAILURE: Missing expected summary data.');
        }

        // 2. Verify Sales Pagination
        console.log('\n[2] Verifying Sales Pagination...');
        const salesRes = await axios.get(`${API_BASE}/sales?page=1&limit=5`);
        console.log(`Pagination: Page ${salesRes.data.page}, Total ${salesRes.data.total}, Rows Returned: ${salesRes.data.sales.length}`);
        if (salesRes.data.sales.length <= 5 && salesRes.data.total !== undefined) {
            console.log('SUCCESS: Pagination working correctly.');
        } else {
            console.error('FAILURE: Pagination mismatch.');
        }

        // 3. Verify Forecast Controller Fix
        console.log('\n[3] Verifying Forecast Controller (Reference Fix)...');
        const forecastRes = await axios.get(`${API_BASE}/forecast`);
        if (forecastRes.data.predictedRevenue) {
            console.log('SUCCESS: Forecast API returned data (no Sale reference error).');
        } else {
            console.error('FAILURE: Forecast API response invalid.');
        }

        // 4. Verify AI Insights payload structure
        console.log('\n[4] Verifying AI Insights (Token Optimization - Triggering fetch)...');
        // This will trigger the backend to fetch latest data and log the "cleanDataset"
        const insightsRes = await axios.post(`${API_BASE}/insights`, { dataset: [] });
        if (insightsRes.data.report) {
            console.log('SUCCESS: AI Insights generated successfully.');
        } else {
            console.error('FAILURE: AI Insights failed.');
        }

    } catch (error) {
        console.error('Verification Error:', error.message);
        if (error.response) {
            console.error('Response Status:', error.response.status);
            console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

verify();
