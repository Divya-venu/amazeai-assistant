const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Sale = require('./models/Sale');

dotenv.config();

async function verifySales() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const sales = await Sale.find({}).limit(10);
        console.log('Recent 10 Sales:');
        sales.forEach(s => {
            console.log(`- ${s.productName} (${s.category}) by ${s.customerName} on ${s.date.toISOString().split('T')[0]}`);
        });

        await mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error.message);
    }
}

verifySales();
