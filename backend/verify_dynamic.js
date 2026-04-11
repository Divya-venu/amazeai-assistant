const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

async function testDynamicUpload() {
    const filePath = path.join(__dirname, 'marketing_data.csv');
    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));

    console.log("🚀 Uploading Marketing Dataset...");
    try {
        const uploadRes = await axios.post('http://localhost:5000/api/upload', formData, {
            headers: formData.getHeaders()
        });

        console.log("✅ Upload Successful!");
        console.log("Schema Inferred:", JSON.stringify(uploadRes.data.schemaMeta, null, 2));

        console.log("\n📊 Fetching Analytics...");
        const analyticsRes = await axios.get('http://localhost:5000/api/analytics');
        
        console.log("\n📈 KPIs Detected:");
        console.log(JSON.stringify(analyticsRes.data.kpis, null, 2));

        console.log("\n📅 Monthly Data Sample:");
        console.log(JSON.stringify(analyticsRes.data.monthlyData[0], null, 2));

        console.log("\n💡 AI Insights:");
        console.log(JSON.stringify(analyticsRes.data.insights, null, 2));

        if (analyticsRes.data.schemaMeta.metrics.includes('Ad Spend')) {
            console.log("\n🔥 VERIFICATION SUCCESS: Ad Spend successfully detected as a metric!");
        } else {
            console.log("\n❌ VERIFICATION FAILED: Metrics not correctly inferred.");
        }

    } catch (err) {
        console.error("❌ Test Failed:", err.response?.data || err.message);
    }
}

testDynamicUpload();
