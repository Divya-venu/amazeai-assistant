const axios = require('axios');
const Sale = require('../models/Sale');
const logger = require('../utils/logger');

/**
 * GET /api/predictions
 * ─────────────────────────────────────────────────────────────────────────────
 * Fetches the last 30 days of sales data from MongoDB, aggregates by daily revenue,
 * and calls the Python ML service at http://localhost:8000/predict.
 * Returns the forecast and insights to the frontend.
 */
exports.getPredictions = async (req, res) => {
    try {
        logger.info('[mlController] GET /api/predictions — starting prediction flow');

        // 1. Aggregate last 30 days of sales
        // If there's no data, we'll try to use the last 30 unique days available
        const historicalData = await Sale.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                    revenue: { $sum: { $multiply: ["$price", "$quantity"] } }
                }
            },
            { $sort: { "_id": 1 } },
            { $limit: 30 }
        ]);

        if (!historicalData || historicalData.length < 2) {
            return res.status(200).json({
                error: 'Insufficient historical data for a 7-day forecast. Need at least 2 unique days.',
                status: 'waiting',
                predictions: [],
                dates: [],
                historical: [],
                trend: 'stable',
                growth: '0%',
                confidence: '0%'
            });
        }

        // 2. Format for Python ML Service
        const mlInput = historicalData.map(d => ({
            date: d._id,
            revenue: d.revenue
        }));

        // 3. Call Python ML Service
        try {
            const mlResponse = await axios.post('http://localhost:8000/predict', {
                data: mlInput
            }, { timeout: 10000 }); // 10 second timeout

            const { predictions, dates, trend, growth, confidence } = mlResponse.data;

            // 4. Return enriched result
            return res.json({
                predictions,
                dates,
                trend,
                growth,
                confidence,
                historical: mlInput,
                status: 'success',
                message: trend === 'upward' ? 'Growth trend detected' : 'Revenue dip expected'
            });

        } catch (mlErr) {
            logger.error('[mlController] ML Service Error:', mlErr.message);
            // Fallback for UI if ML service is down or timed out
            return res.status(503).json({
                error: 'AI Market Predictions engine is currently unavailable.',
                details: mlErr.message,
                status: 'failed'
            });
        }

    } catch (err) {
        logger.error('[mlController] Unexpected error:', err);
        return res.status(500).json({
            error: 'Server error generating predictions',
            details: err.message,
            status: 'failed'
        });
    }
};
