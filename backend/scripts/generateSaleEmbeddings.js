const mongoose = require('mongoose');
require('dotenv').config();

const Sale = require('../models/Sale');
const { generateEmbedding } = require('../services/embeddingService');

async function generateSaleEmbeddings() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log('MongoDB connected.');

        const sales = await Sale.find({});

        console.log(`Sales requiring embeddings: ${sales.length}`);

        for (const sale of sales) {
            const text = `
                Product: ${sale.productName}
                Category: ${sale.category}
                Quantity: ${sale.quantity}
                Price: ${sale.price}
                Cost Price: ${sale.costPrice}
                Profit: ${sale.profit}
                Customer: ${sale.customerName}
                Payment Method: ${sale.paymentMethod}
                Date: ${sale.date}
            `;

            console.log(`Generating embedding for: ${sale.productName}`);

            const embedding = await generateEmbedding(text);

            sale.embedding = embedding;

            await sale.save();

            console.log(
                `Saved ${embedding.length}-dimension embedding for ${sale.productName}`
            );
        }

        console.log('All embeddings generated successfully.');

        await mongoose.disconnect();

    } catch (error) {
        console.error('Embedding generation failed:', error);
        process.exit(1);
    }
}

generateSaleEmbeddings();