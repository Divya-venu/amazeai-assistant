const AIResult = require('../models/AIResult');
const { runPythonScript } = require('../workers/pythonWorker');
const crypto = require('crypto');
const logger = require('../utils/logger');

/**
 * Generates a stable hash for a given dataset to detect changes
 * @param {any} data 
 * @returns {string}
 */
const generateDataHash = (data) => {
    const content = typeof data === 'string' ? data : JSON.stringify(data);
    return crypto.createHash('md5').update(content).digest('hex');
};

/**
 * Unified logic to fetch AI results (Cache-first)
 * @param {string} type - 'forecast', 'anomaly', etc.
 * @param {string} shopId 
 * @param {string} scriptName 
 * @param {any} inputData 
 * @returns {Promise<any>}
 */
const getAIResult = async (type, shopId, scriptName, inputData) => {
    try {
        const inputHash = generateDataHash(inputData);

        // 1. Check persistent cache (MongoDB)
        const cachedResult = await AIResult.findOne({
            type,
            shopId,
            inputHash
        });

        if (cachedResult) {
            console.log(`[AIService] Cache Hit for ${type} (shop: ${shopId})`);
            return cachedResult.result;
        }

        console.log(`[AIService] Cache Miss for ${type}. Computing new result...`);

        // 2. Trigger Worker
        const freshResult = await runPythonScript(scriptName, inputData);

        // 3. Persist for 24h
        await AIResult.findOneAndUpdate(
            { type, shopId, inputHash },
            { 
                result: freshResult,
                createdAt: new Date(),
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
            },
            { upsert: true, new: true }
        );

        return freshResult;
    } catch (error) {
        logger.error(`[AIService Error] type: ${type}, error: ${error.message}`);
        throw error;
    }
};

module.exports = { getAIResult, generateDataHash };
