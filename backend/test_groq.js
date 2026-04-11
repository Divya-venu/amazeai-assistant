require('dotenv').config();
const { askAI } = require('./services/aiService');

async function run() {
    try {
        console.log("Calling GroqCloud LLaMA...");
        const reply = await askAI("Hello, who are you and what model are you based on?");
        console.log("Success! Reply:\n", reply);
    } catch (e) {
        console.error("Test Error:", e.status, e.message);
    }
}

run();
