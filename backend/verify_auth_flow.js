const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function runVerification() {
    console.log('--- Starting Auth Flow Verification ---');

    try {
        // 1. Register a new user
        const uniqueEmail = `verify-${Date.now()}@test.com`;
        console.log(`Step 1: Registering user ${uniqueEmail}...`);
        const regRes = await axios.post(`${API_URL}/auth/register`, {
            name: 'Verifier',
            email: uniqueEmail,
            password: 'password123',
            shopId: 'verify-shop'
        });

        const token = regRes.data.data.accessToken;
        console.log('Registration successful. Token acquired.');

        const config1 = {
            headers: { Authorization: `Bearer ${token}` }
        };

        const config2 = {
            headers: { Authorization: `bearer ${token}` }
        };

        // 2. Test Dashboard (Admin role required)
        console.log('\nStep 2: Testing Dashboard (Monthly Report) with "Bearer"...');
        try {
            const dashRes = await axios.get(`${API_URL}/dashboard/monthly-report`, config1);
            console.log('Dashboard access (Bearer): SUCCESS');
        } catch (err) {
            console.error('Dashboard access (Bearer): FAILED', err.response?.status, err.response?.data);
        }

        console.log('\nStep 2b: Testing Dashboard (Monthly Report) with lowercase "bearer"...');
        try {
            const dashRes = await axios.get(`${API_URL}/dashboard/monthly-report`, config2);
            console.log('Dashboard access (bearer): SUCCESS');
        } catch (err) {
            console.error('Dashboard access (bearer): FAILED', err.response?.status, err.response?.data);
        }

        // 3. Test Assistant Chat
        console.log('\nStep 3: Testing Assistant Chat...');
        try {
            const chatRes = await axios.post(`${API_URL}/assistant/chat`, {
                userId: regRes.data.data.user.id,
                message: 'Hello Assistant'
            }, config1);
            console.log('Assistant Chat: SUCCESS');
        } catch (err) {
            console.error('Assistant Chat: FAILED', err.response?.status, err.response?.data);
        }

    } catch (err) {
        console.error('Verification flow crashed:', err.message);
        if (err.response) console.error('Response:', err.response.data);
    }

    console.log('\n--- Verification Finished ---');
}

runVerification();
