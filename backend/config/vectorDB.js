const OpenAI = require('openai');
const Sale = require('../models/Sale');

const openai = new OpenAI({
    baseURL: "https://api.groq.com/openai/v1",
    apiKey: process.env.GROQ_API_KEY || 'dummy_key',
});

/**
 * Generate embedding using dummy or mock embedding since Groq doesn't support embeddings easily natively
 */
exports.generateEmbedding = async (text) => {
    try {
        console.warn('[VectorDB] Using dummy embedding - Groq API configured for chat completions only');
        return new Array(1536).fill(0); // Standard OpenAI embedding size
    } catch (error) {
        console.error('Embedding Generation Error:', error.message);
        return new Array(1536).fill(0); // Fallback to dummy
    }
};

/**
 * Manual Cosine Similarity implementation
 */
exports.cosineSimilarity = (vecA, vecB) => {
    let dotProduct = 0, normA = 0, normB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

/**
 * Retrieve top 5 sales most relevant to a query embedding
 */
exports.getRelevantContext = async (queryEmbedding) => {
    try {
        // Fetch all sales that have embeddings
        const allSales = await Sale.find({
            embedding: { $exists: true, $ne: [] }
        });

        // Sort by similarity and take top 5
        const results = allSales
            .map(sale => ({
                sale,
                score: exports.cosineSimilarity(queryEmbedding, sale.embedding)
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 5);

        return results.map(r => `Product: ${r.sale.productName}, Qty: ${r.sale.quantity}, Profit: ${r.sale.profit}, Customer: ${r.sale.customerName}, Date: ${r.sale.date}`).join('\n');
    } catch (error) {
        console.error('Context Retrieval Error:', error);
        return "";
    }
};
