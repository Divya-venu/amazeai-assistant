const axios = require('axios');

async function test() {
    try {
        console.log("Testing GENERAL intent...");
        const res1 = await axios.post('http://localhost:5002/api/chat', { message: "Who is the CEO of Apple?" });
        console.log("Response 1:", res1.data);
        
        console.log("\nTesting DATA intent...");
        const res2 = await axios.post('http://localhost:5002/api/chat', { message: "Analyze my shop sales performance" });
        console.log("Response 2:", res2.data);
    } catch (error) {
        console.error("Test Error:", error.response ? error.response.data : error.message);
    }
}

test();
