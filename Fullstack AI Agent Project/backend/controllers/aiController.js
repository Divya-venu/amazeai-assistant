const { getAIResult } = require('../services/aiService');
const { generateInsights } = require('../services/groqService');
const { addAIJob, getJobStatus } = require('../services/queueService');

/**
 * Handle Forecast Requests via Queue
 */
exports.getForecast = async (req, res) => {
    try {
        const { shopId, salesData } = req.body;
        const jobId = await addAIJob('forecast', shopId, 'forecast_model.py', salesData);
        res.json({ success: true, jobId, status: 'queued' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Handle Anomaly Detection Requests via Queue
 */
exports.getAnomalies = async (req, res) => {
    try {
        const { shopId, dataset } = req.body;
        const jobId = await addAIJob('anomaly', shopId, 'anomaly_model.py', dataset);
        res.json({ success: true, jobId, status: 'queued' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Poll Job Status
 */
exports.checkJobStatus = async (req, res) => {
    try {
        const { jobId } = req.params;
        const status = await getJobStatus(jobId);
        res.json({ success: true, data: status });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Handle AI Insights (Groq)
 */
exports.getInsights = async (req, res) => {
    try {
        const { shopId, businessData } = req.body;
        const result = await getAIResult('insights', shopId, generateInsights, businessData);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Fetch Historical AI Results by Type
 */
exports.getResultsByType = async (req, res) => {
    try {
        const { type } = req.params;
        const { shopId } = req.query; // Expecting shopId in query for GET

        if (!shopId) {
            return res.status(400).json({ success: false, error: 'shopId is required' });
        }

        const AIResult = require('../models/AIResult');
        const results = await AIResult.find({ type, shopId })
            .sort({ createdAt: -1 })
            .limit(10);

        res.json({ success: true, data: results });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
