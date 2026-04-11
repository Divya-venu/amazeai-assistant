const { processCSV } = require('./backend/utils/csvProcessor');
const path = require('path');

async function test() {
    try {
        const filePath = path.join(__dirname, 'frontend', 'messy_test.csv');
        console.log('Testing CSV Processor with:', filePath);
        const result = await processCSV(filePath);
        console.log('Meta:', JSON.stringify(result.meta, null, 2));
        console.log('First row:', JSON.stringify(result.data[0], null, 2));
    } catch (e) {
        console.error('Test failed:', e);
    }
}

test();
