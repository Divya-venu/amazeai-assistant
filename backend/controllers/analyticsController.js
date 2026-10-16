const Dataset = require('../models/Dataset');
const Sale = require('../models/Sale');
const { validateAnalyticsInput } = require('../validators/analyticsValidator');
const { computeAnalytics }       = require('../services/analyticsService');
const logger                      = require('../utils/logger');

/**
 * POST /api/analytics
 * ─────────────────────────────────────────────────────────────────────────────
 * Accepts a raw parsed CSV payload as JSON, runs the analytics engine,
 * and returns structured KPIs / monthly trends / top products.
 *
 * No DB read — works entirely on the in-request data.
 * Time complexity: O(n) single pass.
 */
exports.postAnalytics = (req, res) => {
    try {
        logger.info('[analytics] POST /api/analytics — computing from in-request data');

        // 1. Validate & clean input
        const { valid, errors, cleanedData, totalRows, validRows } = validateAnalyticsInput(req.body);

        if (!valid) {
            return res.status(400).json({
                error: errors[0] || 'Invalid CSV format',
                details: errors,
                status: 'failed'
            });
        }

        // 2. Compute analytics (single-pass O(n))
        const result = computeAnalytics(cleanedData, { totalRows, validRows });

        // 3. Surface any non-fatal row warnings alongside the result
        if (errors.length > 0) {
            result.warnings = errors;
        }

        return res.status(200).json(result);

    } catch (err) {
        logger.error('[analytics] Unexpected error in postAnalytics:', err);
        return res.status(500).json({
            error: 'Analytics engine encountered an unexpected error.',
            details: err.message,
            status: 'failed'
        });
    }
};

exports.getAnalyticsOverview = async (req, res) => {
    try {
        console.log("Backend: Reading sales collection for dashboard");

        // Read sales records from MongoDB
        const sales = await Sale.find().lean();

        if (!sales || sales.length === 0) {
            return res.status(200).json({
                kpis: {
                    revenue: 0,
                    expenses: 0,
                    profit: 0,
                    margin: 0,
                    recordCount: 0,
                    lastUpdated: new Date().toISOString()
                },
                insights: {
                    systemStatus: "No sales data found"
                },
                monthlyData: [],
                categoryData: [],
                schemaMeta: null
            });
        }

        let totalRevenue = 0;
        let totalCost = 0;
        let totalProfit = 0;

        const monthlyMap = {};
        const categoryMap = {};

        sales.forEach((sale) => {
            const price = Number(sale.price) || 0;
            const costPrice = Number(sale.costPrice) || 0;
            const quantity = Number(sale.quantity) || 0;

            const revenue = price * quantity;
            const cost = costPrice * quantity;
            const profit = revenue - cost;

            totalRevenue += revenue;
            totalCost += cost;
            totalProfit += profit;

            // Monthly data
            const saleDate = sale.date
                ? new Date(sale.date)
                : new Date(sale.createdAt || Date.now());

            const monthKey = `${saleDate.getFullYear()}-${String(
                saleDate.getMonth() + 1
            ).padStart(2, '0')}`;

            if (!monthlyMap[monthKey]) {
                monthlyMap[monthKey] = {
                    revenue: 0,
                    expenses: 0,
                    profit: 0
                };
            }

            monthlyMap[monthKey].revenue += revenue;
            monthlyMap[monthKey].expenses += cost;
            monthlyMap[monthKey].profit += profit;

            // Category data
            const category = sale.category || "Unknown";

            if (!categoryMap[category]) {
                categoryMap[category] = 0;
            }

            categoryMap[category] += revenue;
        });

        const margin = totalRevenue > 0
            ? (totalProfit / totalRevenue) * 100
            : 0;

        const monthlyData = Object.keys(monthlyMap)
            .sort()
            .map((month) => ({
                month: new Date(`${month}-01`).toLocaleDateString(
                    'en-US',
                    { month: 'short' }
                ),
                rawDate: month,
                revenue: Number(monthlyMap[month].revenue.toFixed(2)),
                expenses: Number(monthlyMap[month].expenses.toFixed(2)),
                profit: Number(monthlyMap[month].profit.toFixed(2))
            }));

        const categoryData = Object.entries(categoryMap)
            .sort((a, b) => b[1] - a[1])
            .map(([name, revenue]) => ({
                name,
                revenue: Number(revenue.toFixed(2)),
                value: totalRevenue > 0
                    ? Number(((revenue / totalRevenue) * 100).toFixed(1))
                    : 0
            }));

        const response = {
            kpis: {
                revenue: Number(totalRevenue.toFixed(2)),
                expenses: Number(totalCost.toFixed(2)),
                profit: Number(totalProfit.toFixed(2)),
                margin: Number(margin.toFixed(2)),
                recordCount: sales.length,
                lastUpdated: new Date().toISOString()
            },
            insights: {
                systemStatus: "Sales data loaded successfully",
                recordCount: sales.length
            },
            monthlyData,
            categoryData,
            schemaMeta: {
                metrics: ["revenue", "expenses", "profit", "margin"],
                dimensions: ["category"],
                timeColumn: "date"
            }
        };

        console.log("Dashboard analytics response:", response);

        return res.status(200).json(response);

    } catch (error) {
        console.error(
            "Backend Error in sales analytics overview:",
            error
        );

        return res.status(500).json({
            error: "Server error generating sales analytics overview",
            details: error.message
        });
    }
};