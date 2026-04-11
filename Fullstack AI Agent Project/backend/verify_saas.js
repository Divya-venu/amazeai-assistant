const mongoose = require('mongoose');
const { getAIResult } = require('./services/aiService');
require('dotenv').config();

const testData = [
    { date: "2026-01-01", revenue: 1000 },
    { date: "2026-01-02", revenue: 1200 },
    { date: "2026-01-03", revenue: 1100 },
    { date: "2026-01-04", revenue: 1300 },
    { date: "2026-01-05", revenue: 1250 }
];

async function runVerification() {
    try {
        console.log('--- Project Verification Started ---');
        
        // 1. Connect to DB
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ai-agent-saas');
        console.log('[1/4] MongoDB Connected.');

        const shopId = "test-shop-123";

        // 2. Test Forecast (Cache Miss)
        console.log('\n[2/4] Testing Forecast (Expected: Cache Miss)...');
        const start1 = Date.now();
        const result1 = await getAIResult('forecast', shopId, 'forecast_model.py', testData);
        const end1 = Date.now();
        console.log(`Result: Success (${result1.forecast.length} days predicted)`);
        console.log(`Time taken: ${end1 - start1}ms`);

        // 3. Test Forecast (Cache Hit)
        console.log('\n[3/4] Testing Forecast (Expected: Cache Hit)...');
        const start2 = Date.now();
        const result2 = await getAIResult('forecast', shopId, 'forecast_model.py', testData);
        const end2 = Date.now();
        console.log(`Result: Success (${result2.forecast.length} days predicted)`);
        console.log(`Time taken: ${end2 - start2}ms (Instant!)`);

        // 4. Test Anomaly Detection
        console.log('\n[4/5] Testing Anomaly Detection...');
        const anomalyResult = await getAIResult('anomaly', shopId, 'anomaly_model.py', testData);
        console.log(`Result: Success (${anomalyResult.anomalies.length} anomalies found)`);

        // 5. Test AI Insights (Groq)
        console.log('\n[5/5] Testing AI Insights (Groq - Expected: Cache Miss)...');
        const start3 = Date.now();
        const insights1 = await getAIResult('insights', shopId, require('./services/groqService').generateInsights, testData);
        const end3 = Date.now();
        console.log(`Result: Success (${insights1.insights.length} insights generated)`);
        console.log(`Time taken: ${end3 - start3}ms`);

        console.log('\n[5/5] Testing AI Insights (Groq - Expected: Cache Hit)...');
        const start4 = Date.now();
        const insights2 = await getAIResult('insights', shopId, require('./services/groqService').generateInsights, testData);
        const end4 = Date.now();
        console.log(`Result: Success (${insights2.insights.length} insights generated)`);
        console.log(`Time taken: ${end4 - start4}ms (Instant!)`);

        console.log('\n--- VERIFICATION COMPLETE: ALL SYSTEMS NOMINAL ---');
        process.exit(0);
    } catch (error) {
        console.error('\n--- VERIFICATION FAILED ---');
        console.error(error);
        process.exit(1);
    }
}

runVerification();
