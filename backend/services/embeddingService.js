const { pipeline } = require('@huggingface/transformers');

let embeddingPipeline = null;

async function getEmbeddingPipeline() {
    if (!embeddingPipeline) {
        console.log('Loading embedding model...');

        embeddingPipeline = await pipeline(
            'feature-extraction',
            'Xenova/all-MiniLM-L6-v2'
        );

        console.log('Embedding model loaded.');
    }

    return embeddingPipeline;
}

async function generateEmbedding(text) {
    const extractor = await getEmbeddingPipeline();

    const output = await extractor(text, {
        pooling: 'mean',
        normalize: true
    });

    return Array.from(output.data);
}

module.exports = {
    generateEmbedding
};