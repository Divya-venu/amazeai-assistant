const axios = require('axios');
const fs = require('fs');
const path = require('path');

const testPDFReport = async () => {
    try {
        console.log("Testing GET /api/reports/generate...");
        const response = await axios.get('http://localhost:5000/api/reports/generate', {
            responseType: 'arraybuffer' // Use arraybuffer for direct PDF data
        });
        
        console.log("Response Status:", response.status);
        console.log("Response Content-Type:", response.headers['content-type']);
        
        if (response.headers['content-type'] === 'application/pdf') {
            const filePath = path.join(__dirname, 'test_report.pdf');
            fs.writeFileSync(filePath, response.data);
            console.log("PDF saved successfully to:", filePath);
            
            // Basic sanity check: check if file has PDF header
            const buffer = Buffer.from(response.data);
            if (buffer.toString('utf-8', 0, 5) === '%PDF-') {
                console.log("PDF header verified.");
            } else {
                console.warn("PDF header not found in response.");
            }
        } else {
            console.error("Failed: Response is not a PDF");
        }
    } catch (error) {
        console.error("Error testing AI report generator:");
        if (error.response) {
            console.error("Status:", error.response.status);
            try {
                const errorData = JSON.parse(Buffer.from(error.response.data).toString());
                console.error("Data:", JSON.stringify(errorData, null, 2));
            } catch (e) {
                console.error("Raw Error Body:", Buffer.from(error.response.data).toString().substring(0, 100));
            }
        } else {
            console.error(error.message || error);
        }
    }
};

testPDFReport();
