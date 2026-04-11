const Sale = require('../models/Sale');

/**
 * @desc    Get global sales aggregated by country
 * @route   GET /api/global-sales
 * @access  Public
 */
exports.getGlobalSales = async (req, res) => {
    try {
        console.log('[Global Sales] Aggregating sales by country...');

        const result = await Sale.aggregate([
            {
                $match: {
                    country: { $ne: 'Unknown', $exists: true, $ne: null }
                }
            },
            {
                $group: {
                    _id: '$country',
                    revenue: {
                        $sum: { $multiply: ['$price', '$quantity'] }
                    }
                }
            },
            { $sort: { revenue: -1 } }
        ]);

        // If no real country data exists, return empty object
        if (!result || result.length === 0) {
            console.log('[Global Sales] No country data found in database.');
            return res.json({});
        }

        // Convert array to { Country: revenue } object
        const salesByCountry = {};
        result.forEach(item => {
            if (item._id && item._id !== 'Unknown') {
                salesByCountry[item._id] = Math.round(item.revenue);
            }
        });

        res.json(salesByCountry);
    } catch (error) {
        console.error('[Global Sales] Error:', error.message);
        res.status(500).json({ error: 'Failed to fetch global sales data' });
    }
};
