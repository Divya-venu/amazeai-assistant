const cron = require('node-cron');
const Sale = require('../models/Sale');
const Product = require('../models/Product');

// Low Stock Alert Job (Every day at midnight)
cron.schedule('0 0 * * *', async () => {
    console.log('Running Low Stock Alert Job...');
    try {
        const lowStockProducts = await Product.find({ stock: { $lt: 10 } });
        if (lowStockProducts.length > 0) {
            console.log(`Alert: ${lowStockProducts.length} products are low on stock!`);
            // Here you would send an email or notification to the shop owner
        }
    } catch (error) {
        console.error('Cron Job Error:', error);
    }
});

// Monthly Profit Summary Generator (1st of every month)
cron.schedule('0 0 1 * *', async () => {
    console.log('Generating Monthly Profit Summaries...');
    // Logic to process previous month data for all shops
});
