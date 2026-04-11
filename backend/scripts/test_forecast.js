const axios = require('axios');

async function testForecast() {
    const dataset = [
        { month: 'Jan', revenue: 100000 },
        { month: 'Feb', revenue: 110000 },
        { month: 'Mar', revenue: 120000 },
        { month: 'Apr', revenue: 140000 }
    ];

    try {
        console.log("Sending dataset:", dataset);
        const response = await axios.post('http://localhost:5000/api/forecast', { dataset });
        console.log("Response:", response.data);
    } catch (e) {
        console.error("Error:", e.response ? e.response.data : e.message);
    }
}

testForecast();
