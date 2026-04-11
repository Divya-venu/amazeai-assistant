const Sale = require('../models/Sale');
const Expense = require('../models/Expense');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');

/**
 * @desc    Get Smart Alerts for the dashboard
 * @route   GET /api/smart-alerts
 * @access  Private/Admin
 */
exports.getSmartAlerts = asyncHandler(async (req, res) => {
    // In a real app, we'd fetch actual calculated metrics.
    // For this implementation, we'll aggregate some data to make it "smart".
    
    const shopId = req.shopId;
    const { from, to, range, search } = req.query;

    // 1. Build common filter
    let commonQuery = { shopId };
    let dateFilter = {};
    if (from) dateFilter.$gte = new Date(from);
    if (to)   dateFilter.$lte = new Date(to);

    if (!from && range && range !== 'All') {
        const days = parseInt(range.replace('d', ''));
        if (!isNaN(days)) {
            dateFilter.$gte = new Date(Date.now() - days * 86400000);
        }
    }

    if (Object.keys(dateFilter).length > 0) {
        commonQuery.date = dateFilter;
    }

    if (search) {
        const regex = new RegExp(search, 'i');
        commonQuery.$or = [
            { productName: regex },
            { category: regex },
            { customerName: regex }
        ];
    }

    // 2. Fetch metrics using Aggregation for Speed
    const [salesStats, expenseStats] = await Promise.all([
        Sale.aggregate([
            { $match: commonQuery },
            { $sort: { date: -1 } },
            { $limit: 100 }, 
            { 
                $group: { 
                    _id: null, 
                    totalRevenue: { $sum: { $multiply: ["$price", "$quantity"] } }
                } 
            }
        ]),
        Expense.aggregate([
            { $match: { shopId } }, // Expenses usually don't have search/product name link unless complex
            { $sort: { date: -1 } },
            { $limit: 10 },
            { 
                $group: { 
                    _id: null, 
                    totalExpenses: { $sum: "$amount" } 
                } 
            }
        ])
    ]);

    let alerts = [];

    const totalRevenue = salesStats[0]?.totalRevenue || 0;
    const totalExpenses = expenseStats[0]?.totalExpenses || 0;
    const profit = totalRevenue - totalExpenses;

    const averageExpense = 50000; // Mock average

    // Condition 1: Expense Spike
    if (totalExpenses > averageExpense * 1.4) {
        alerts.push({
            type: "Expense anomaly",
            message: "Sales expense increased significantly this period.",
            severity: "high",
            trend: "+45%"
        });
    }

    // Condition 2: Profit Decrease
    if (profit < 30000 && totalRevenue > 0) {
        alerts.push({
            type: "Profit decrease",
            message: "Net Profit dropped below targets this month.",
            severity: "medium",
            trend: "-5%"
        });
    }

    // Condition 3: Revenue Alert (Generic)
    if (totalRevenue === 0) {
        alerts.push({
            type: "Data Alert",
            message: "No revenue recorded in the current period.",
            severity: "low"
        });
    }

    // Add a default welcome/info alert if none exist
    if (alerts.length === 0) {
        alerts.push({
            type: "System Check",
            message: "Business metrics are within normal ranges.",
            severity: "low"
        });
    }

    return res.json(new ApiResponse(200, { alerts }, "Smart alerts retrieved successfully"));
});
