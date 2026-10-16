const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const Sale = require('./models/Sale');
const { generateEmbedding } = require('./config/vectorDB');

const sampleData = [
    { productName: "Black Formal Shirt", category: "Shirt", price: 1200, costPrice: 800, quantity: 2, customerName: "Ravi Kumar", paymentMethod: "UPI", date: "2026-02-25" },
    { productName: "Slim Fit Jeans", category: "Jeans", price: 2000, costPrice: 1500, quantity: 1, customerName: "Manoj", paymentMethod: "Cash", date: "2026-02-26" },
    { productName: "White Cotton Shirt", category: "Shirt", price: 1100, costPrice: 750, quantity: 3, customerName: "Suresh", paymentMethod: "Card", date: "2026-02-27" },
    { productName: "Black Blazer", category: "Blazer", price: 3500, costPrice: 2500, quantity: 1, customerName: "Karthik", paymentMethod: "UPI", date: "2026-02-28" },
    { productName: "Casual T-Shirt", category: "T-Shirt", price: 700, costPrice: 400, quantity: 4, customerName: "Ajay", paymentMethod: "Cash", date: "2026-03-01" },
    { productName: "Formal Pants", category: "Pants", price: 1800, costPrice: 1200, quantity: 2, customerName: "Rahul", paymentMethod: "UPI", date: "2026-03-01" },
    { productName: "Denim Jacket", category: "Jacket", price: 3000, costPrice: 2200, quantity: 1, customerName: "Vijay", paymentMethod: "Card", date: "2026-03-02" },
    { productName: "Checked Shirt", category: "Shirt", price: 1300, costPrice: 900, quantity: 2, customerName: "Deepak", paymentMethod: "UPI", date: "2026-03-03" },
    { productName: "Leather Belt", category: "Accessories", price: 600, costPrice: 350, quantity: 3, customerName: "Ramesh", paymentMethod: "Cash", date: "2026-03-03" },
    { productName: "Party Wear Shirt", category: "Shirt", price: 1500, costPrice: 1000, quantity: 2, customerName: "Naveen", paymentMethod: "UPI", date: "2026-03-04" }
];

async function seedSales() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        await Sale.deleteMany({});
        console.log('Cleared existing sales');

        console.log('Seeding sample data...');

        const allSeededRecords = [];

        for (const item of sampleData) {
    // Generate dummy embedding if quota persists, else it uses real one
    const vector = await generateEmbedding(
        `${item.productName} in ${item.category}`
    );

    allSeededRecords.push({
        ...item,
        profit: (item.price - item.costPrice) * item.quantity,
        embedding: vector
    });
}

        await Sale.insertMany(allSeededRecords);
        console.log(`Successfully seeded ${allSeededRecords.length} records`);
        process.exit(0);
    } catch (error) {
        console.error('Seed Sales Error:', error.message);
        process.exit(1);
    }
}

seedSales();
