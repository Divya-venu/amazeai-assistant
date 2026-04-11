require('dotenv').config();
const { askAI } = require('./services/aiService');

async function run() {
    try {
        console.log("Calling OpenAI...");
        const reply = await askAI("Hello, are you there?");
        console.log("Success! Reply:", reply);
    } catch (e) {
        console.error("Test Error:", e.status, e.message);
    }
}

run();
