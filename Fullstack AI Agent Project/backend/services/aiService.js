const AIResult = require('../models/AIResult');
const crypto = require('crypto');

/**
 * Orchestrates AI processing with persistent caching
 * @param {string} type - 'forecast', 'anomaly', 'insights'
 * @param {string} shopId - Tenant ID
 * @param {string|function} source - Python script name OR async provider function
 * @param {object} inputData - Data for processing
 */
const getAIResult = async (type, shopId, source, inputData) => {
    const inputHash = crypto.createHash('md5').update(JSON.stringify(inputData)).digest('hex');

    const cachedResult = await AIResult.findOne({ type, shopId, inputHash });
    if (cachedResult) {
        console.log(`[AIService] Cache Hit for ${type}`);
        return cachedResult.result;
    }

    console.log(`[AIService] Cache Miss for ${type}. Executing provider...`);
    
    let result;
    if (typeof source === 'function') {
        // Execute LLM or internal JS service
        result = await source(inputData);
    } else {
        // Execute Python ML worker
        const { runPythonScript } = require('../workers/pythonWorker');
        result = await runPythonScript(source, inputData);
    }

    await AIResult.create({ type, shopId, inputHash, result });
    return result;
};

module.exports = { getAIResult };
