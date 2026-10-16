require('dotenv').config();

const mongoose = require('mongoose');
const { generateEmbedding } = require('../services/embeddingService');
const { getRelevantContext } = require('../config/vectorDB');

async function testRag() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log('MongoDB connected.');

        const question = 'Which product has the highest profit?';

        console.log(`Question: ${question}`);

        const queryEmbedding = await generateEmbedding(question);

        console.log(
            `Query embedding dimensions: ${queryEmbedding.length}`
        );

        const context = await getRelevantContext(
            queryEmbedding,
            'TRENDS'
        );

       console.log('\n========== RETRIEVED CONTEXT ==========');
console.log(context);
console.log('=======================================');

        await mongoose.disconnect();

    } catch (error) {
        console.error('RAG test failed:', error);
        process.exit(1);
    }
}

testRag();