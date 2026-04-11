const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

async function verifySaaSIngestion() {
    const filePath = path.join(__dirname, 'saas_marketing.csv');
    if (!fs.existsSync(filePath)) {
        console.error("❌ Test file missing: saas_marketing.csv");
        return;
    }

    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));

    console.log("🚀 Uploading SaaS Marketing Dataset...");
    try {
        const uploadRes = await axios.post('http://localhost:5000/api/upload', formData, {
            headers: formData.getHeaders()
        });

        console.log("✅ Upload Successful!");
        console.log("Schema Inferred:", JSON.stringify(uploadRes.data.schemaMeta, null, 2));

        const schema = uploadRes.data.schemaMeta;
        if (schema.metrics.includes('Ad Spend') && schema.metrics.includes('Signups')) {
            console.log("🔥 SUCCESS: Ad Spend and Signups correctly identified as metrics.");
        } else {
            console.error("❌ FAILED: Metrics not correctly inferred.");
            process.exit(1);
        }

        if (schema.primaryMetric) {
            console.log(`🔥 SUCCESS: Primary Metric identified: ${schema.primaryMetric}`);
        } else {
            console.error("❌ FAILED: No primaryMetric identifies.");
            process.exit(1);
        }

        console.log("\n📊 Fetching Analytics...");
        const analyticsRes = await axios.get('http://localhost:5000/api/analytics');
        
        console.log("\n📈 KPIs Detected:");
        console.log(JSON.stringify(analyticsRes.data.kpis, null, 2));

        const kpis = analyticsRes.data.kpis;
        if (kpis['Ad Spend'] > 0 && kpis['Signups'] > 0) {
            console.log("🔥 SUCCESS: Dynamic aggregation worked for SaaS metrics.");
        } else {
            console.error("❌ FAILED: KPI values are zero or missing.");
            process.exit(1);
        }

        console.log("\n📅 Monthly Data Sample:");
        console.log(JSON.stringify(analyticsRes.data.monthlyData[0], null, 2));

        console.log("\n🎉 VERIFICATION COMPLETE: ALL SYSTEMS GO!");

    } catch (err) {
        console.error("❌ Test Failed:", err.response?.data || err.message);
        process.exit(1);
    }
}

verifySaaSIngestion();
