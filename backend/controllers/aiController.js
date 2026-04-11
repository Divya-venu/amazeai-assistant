const Sale = require('../models/Sale');
const { getAIResult } = require('../services/aiService');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');
const logger = require('../utils/logger');

/**
 * @desc    Get Revenue Forecast (SaaS Pattern)
 * @route   POST /api/ai/forecast
 */
exports.getForecast = asyncHandler(async (req, res) => {
    const shopId = req.shopId || 'test-shop-123';
    
    // 1. Fetch data for ML
    // Similar to legacy forecastController, we group by date
    const salesData = await Sale.aggregate([
        { $match: { shopId } },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                revenue: { $sum: "$revenue" }
            }
        },
        { $sort: { "_id": 1 } },
        { $project: { date: "$_id", revenue: 1, _id: 0 } }
    ]);

    if (salesData.length < 5) {
        return res.status(400).json(new ApiResponse(400, null, "Insufficient data for forecasting (minimum 5 days required)"));
    }

    // 2. Compute/Fetch AI Result
    const result = await getAIResult('forecast', shopId, 'forecast.py', salesData);
    
    res.json(new ApiResponse(200, result, "Forecast retrieved successfully"));
});

/**
 * @desc    Get Anomaly Detection (SaaS Pattern)
 * @route   POST /api/ai/anomalies
 */
exports.getAnomalies = asyncHandler(async (req, res) => {
    const shopId = req.shopId || 'test-shop-123';

    // Fetch granular sales data for anomaly detection
    const salesData = await Sale.find({ shopId })
        .select('date revenue productName category -_id')
        .sort({ date: -1 })
        .limit(100);

    const result = await getAIResult('anomaly', shopId, 'anomaly_detection.py', salesData);
    
    res.json(new ApiResponse(200, result, "Anomalies retrieved successfully"));
});

/**
 * @desc    Get AI Insights & Recommendations (SaaS Pattern)
 * @route   POST /api/ai/insights
 */
exports.getInsights = asyncHandler(async (req, res) => {
    const shopId = req.shopId || 'test-shop-123';

    const salesSummary = await Sale.aggregate([
        { $match: { shopId } },
        {
            $group: {
                _id: "$category",
                revenue: { $sum: "$revenue" },
                quantity: { $sum: "$quantity" }
            }
        }
    ]);

    // Use insights route logic (direct Groq or Python script wrapper)
    // For consistency with the diagram, we'll use a service call
    const result = await getAIResult('insights', shopId, 'insights.py', salesSummary);
    
    res.json(new ApiResponse(200, result, "Insights retrieved successfully"));
});
