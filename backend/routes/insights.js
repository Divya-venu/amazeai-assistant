const express = require('express');
const router = express.Router();

const Groq = require('groq-sdk');
const Sale = require('../models/Sale');

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

/**
 * POST /api/insights
 * Generate live business insights from MongoDB sales data
 */
router.post('/', async (req, res) => {
    try {
        let { dataset } = req.body;

        console.log(
            `[Backend Insights] Request received. Dataset size: ${
                Array.isArray(dataset) ? dataset.length : 'N/A'
            }`
        );

        // If frontend doesn't provide a dataset,
        // get the actual sales data from MongoDB.
        if (!Array.isArray(dataset) || dataset.length === 0) {
            console.log('[AI Insights] Fetching sales data from MongoDB...');

            dataset = await Sale.find()
                .lean()
                .sort({ date: 1 });
        }

        if (!dataset || dataset.length === 0) {
            return res.status(400).json({
                error: 'No sales data available for analysis.'
            });
        }

        console.log(
            `[AI Insights] Analyzing ${dataset.length} sales records.`
        );

        // --------------------------------------------------
        // 1. Calculate financial KPIs
        // --------------------------------------------------

        const totalRevenue = dataset.reduce((sum, sale) => {
            return sum + (
                Number(sale.price || 0) *
                Number(sale.quantity || 0)
            );
        }, 0);

        const totalExpenses = dataset.reduce((sum, sale) => {
            return sum + (
                Number(sale.costPrice || 0) *
                Number(sale.quantity || 0)
            );
        }, 0);

        const netProfit = totalRevenue - totalExpenses;

        const profitMargin = totalRevenue > 0
            ? (netProfit / totalRevenue) * 100
            : 0;

        // --------------------------------------------------
        // 2. Category analysis
        // --------------------------------------------------

        const categoryMap = {};

        dataset.forEach((sale) => {
            const category = sale.category || 'Unknown';

            const revenue =
                Number(sale.price || 0) *
                Number(sale.quantity || 0);

            const cost =
                Number(sale.costPrice || 0) *
                Number(sale.quantity || 0);

            if (!categoryMap[category]) {
                categoryMap[category] = {
                    revenue: 0,
                    cost: 0,
                    profit: 0
                };
            }

            categoryMap[category].revenue += revenue;
            categoryMap[category].cost += cost;
            categoryMap[category].profit += revenue - cost;
        });

        const categoryData = Object.entries(categoryMap)
            .map(([name, values]) => ({
                name,
                revenue: Math.round(values.revenue),
                cost: Math.round(values.cost),
                profit: Math.round(values.profit)
            }))
            .sort((a, b) => b.revenue - a.revenue);

        const topCategory =
            categoryData.length > 0
                ? categoryData[0].name
                : 'Unknown';

        // --------------------------------------------------
        // 3. Product analysis
        // --------------------------------------------------

        const productMap = {};

        dataset.forEach((sale) => {

            // Support both product and productName
            const product =
                sale.product ||
                sale.productName ||
                'Unknown Product';

            const revenue =
                Number(sale.price || 0) *
                Number(sale.quantity || 0);

            const cost =
                Number(sale.costPrice || 0) *
                Number(sale.quantity || 0);

            if (!productMap[product]) {
                productMap[product] = {
                    revenue: 0,
                    cost: 0,
                    profit: 0,
                    quantity: 0
                };
            }

            productMap[product].revenue += revenue;
            productMap[product].cost += cost;
            productMap[product].profit += revenue - cost;
            productMap[product].quantity += Number(
                sale.quantity || 0
            );
        });

        const productData = Object.entries(productMap)
            .map(([name, values]) => ({
                name,
                revenue: Math.round(values.revenue),
                cost: Math.round(values.cost),
                profit: Math.round(values.profit),
                quantity: values.quantity
            }))
            .sort((a, b) => b.profit - a.profit);

        const mostProfitableProduct =
            productData.length > 0
                ? productData[0]
                : null;

        // --------------------------------------------------
        // 4. Monthly analysis
        // --------------------------------------------------

        const monthlyMap = {};

        dataset.forEach((sale) => {

            if (!sale.date) {
                return;
            }

            const date = new Date(sale.date);

            if (isNaN(date.getTime())) {
                return;
            }

            const monthKey =
                `${date.getFullYear()}-${String(
                    date.getMonth() + 1
                ).padStart(2, '0')}`;

            const monthName = date.toLocaleString(
                'en-US',
                { month: 'short' }
            );

            const revenue =
                Number(sale.price || 0) *
                Number(sale.quantity || 0);

            const cost =
                Number(sale.costPrice || 0) *
                Number(sale.quantity || 0);

            if (!monthlyMap[monthKey]) {
                monthlyMap[monthKey] = {
                    month: monthName,
                    revenue: 0,
                    cost: 0,
                    profit: 0
                };
            }

            monthlyMap[monthKey].revenue += revenue;
            monthlyMap[monthKey].cost += cost;
            monthlyMap[monthKey].profit += revenue - cost;
        });

        const monthlyData = Object.entries(monthlyMap)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([key, values]) => ({
                month: values.month,
                rawDate: key,
                revenue: Math.round(values.revenue),
                cost: Math.round(values.cost),
                profit: Math.round(values.profit)
            }));

        // --------------------------------------------------
        // 5. Revenue growth
        // --------------------------------------------------

        let revenueGrowth = 0;

        if (monthlyData.length >= 2) {

            const firstMonth =
                monthlyData[0].revenue;

            const lastMonth =
                monthlyData[monthlyData.length - 1].revenue;

            if (firstMonth > 0) {
                revenueGrowth =
                    ((lastMonth - firstMonth) /
                        firstMonth) * 100;
            }
        }

        const revenueTrend =
            revenueGrowth > 0
                ? 'upward'
                : revenueGrowth < 0
                    ? 'downward'
                    : 'stable';

        // --------------------------------------------------
        // 6. Prepare actual calculated data for Groq
        // --------------------------------------------------

        const analysisData = {
            recordCount: dataset.length,

            financials: {
                totalRevenue: Math.round(totalRevenue),
                totalExpenses: Math.round(totalExpenses),
                netProfit: Math.round(netProfit),
                profitMargin: Number(
                    profitMargin.toFixed(1)
                )
            },

            revenueTrend: {
                growthPercent: Number(
                    revenueGrowth.toFixed(1)
                ),
                direction: revenueTrend
            },

            topCategory,

            mostProfitableProduct,

            monthlyData,

            categoryData,

            productData
        };

        // --------------------------------------------------
        // 7. Ask Groq for recommendations
        // --------------------------------------------------

        const prompt = `
You are an AI Business Intelligence Assistant.

Analyze the following CALCULATED business data.

IMPORTANT:
- Do NOT invent numbers.
- Do NOT change the calculated financial values.
- Do NOT invent products or categories.
- Base recommendations only on the supplied data.
- Give practical business recommendations.
- Keep the recommendations concise.

BUSINESS DATA:

${JSON.stringify(analysisData, null, 2)}

Return ONLY valid JSON using this structure:

{
    "recommendations": [
        "Recommendation 1",
        "Recommendation 2",
        "Recommendation 3"
    ],
    "summary": "A short executive summary based on the actual data."
}
`;

        let recommendations = [];
        let summary = '';

        try {

            console.log(
                '[AI Insights] Calling Groq for recommendations...'
            );

            const response =
                await groq.chat.completions.create({

                    model: 'openai/gpt-oss-20b',

                    messages: [
                        {
                            role: 'system',
                            content:
                                'You are a senior business intelligence analyst. Return valid JSON only.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],

                    temperature: 0.3,

                    response_format: {
                        type: 'json_object'
                    }
                });

            const aiResult =
                JSON.parse(
                    response.choices[0].message.content
                );

            recommendations =
                aiResult.recommendations || [];

            summary =
                aiResult.summary || '';

        } catch (groqError) {

            console.error(
                '[AI Insights] Groq error:',
                groqError.message
            );

            recommendations = [
                `Focus on ${topCategory}, which currently generates the highest revenue.`,
                `Review costs and margins for ${mostProfitableProduct?.name || 'your products'}.`,
                `Monitor the ${revenueTrend} revenue trend and adjust inventory accordingly.`
            ];

            summary =
                `Analysis performed on ${dataset.length} sales records. ` +
                `The business generated ₹${Math.round(netProfit).toLocaleString('en-IN')} ` +
                `net profit with a ${profitMargin.toFixed(1)}% profit margin.`;
        }

        // --------------------------------------------------
        // 8. Return everything to frontend
        // --------------------------------------------------

        res.json({

            report: {
                totalRevenue:
                    `₹${Math.round(totalRevenue).toLocaleString('en-IN')}`,

                totalExpenses:
                    `₹${Math.round(totalExpenses).toLocaleString('en-IN')}`,

                netProfit:
                    `₹${Math.round(netProfit).toLocaleString('en-IN')}`,

                profitMargin:
                    `${profitMargin.toFixed(1)}%`,

                topCategory,

                revenueGrowth:
                    `${revenueGrowth.toFixed(1)}%`,

                revenueTrend,

                mostProfitableProduct:
                    mostProfitableProduct?.name || 'N/A',

                mostProfitableProductProfit:
                    mostProfitableProduct
                        ? `₹${mostProfitableProduct.profit.toLocaleString('en-IN')}`
                        : '₹0'
            },

            monthlyData,

            categoryData,

            productData,

            recommendations,

            summary,

            recordCount: dataset.length
        });

    } catch (error) {

        console.error(
            '[AI Insights Error]:',
            error.message
        );

        res.status(500).json({
            error: 'Failed to generate AI insights',
            details: error.message
        });
    }
});

module.exports = router;