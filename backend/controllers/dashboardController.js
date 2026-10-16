const Sale = require('../models/Sale');
const Expense = require('../models/Expense');
const AIUsage = require('../models/AIUsage');
const Groq = require('groq-sdk');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

// @desc    Get monthly financial report (Scoped to shopId)
exports.getMonthlyReport = asyncHandler(async (req, res) => {
    const shopId = req.shopId;

    // 1. Monthly Sales & Cost Aggregation
    const salesAggregation = await Sale.aggregate([
        { $match: { shopId } },
        {
            $lookup: {
                from: "products",
                localField: "productName",
                foreignField: "name",
                as: "productDetails"
            }
        },
        { $unwind: { path: "$productDetails", preserveNullAndEmptyArrays: true } },
        {
            $group: {
                _id: {
                    month: { $month: "$date" },
                    year: { $year: "$date" }
                },
                totalRevenue: { $sum: "$revenue" },
                totalCost: {
                    $sum: {
                        $multiply: [
                            { $ifNull: ["$productDetails.costPrice", 0] },
                            { $ifNull: ["$quantity", 0] }
                        ]
                    }
                },
                salesCount: { $sum: 1 }
            }
        },
        { $sort: { "_id.year": -1, "_id.month": -1 } }
    ]);

    // 2. Monthly Expenses Aggregation
    const expenseAggregation = await Expense.aggregate([
        { $match: { shopId } },
        {
            $group: {
                _id: {
                    month: { $month: "$date" },
                    year: { $year: "$date" }
                },
                totalExpenses: { $sum: "$amount" }
            }
        }
    ]);

    // 3. Combine Data
    const monthlyBreakdown = salesAggregation.map(saleMonth => {
        const expenseMonth = expenseAggregation.find(
            exp => exp._id.month === saleMonth._id.month && exp._id.year === saleMonth._id.year
        );

        const revenue = saleMonth.totalRevenue;
        const cost = saleMonth.totalCost;
        const expenses = expenseMonth ? expenseMonth.totalExpenses : 0;
        const netProfit = revenue - cost - expenses;
        const profitMargin = revenue > 0 ? ((netProfit / revenue) * 100).toFixed(2) : 0;

        return {
            month: `${saleMonth._id.year}-${saleMonth._id.month}`,
            revenue,
            cost,
            expenses,
            netProfit,
            profitMargin: `${profitMargin}%`
        };
    });

    const totals = monthlyBreakdown.reduce((acc, curr) => ({
        revenue: acc.revenue + curr.revenue,
        cost: acc.cost + curr.cost,
        expenses: acc.expenses + curr.expenses,
        netProfit: acc.netProfit + curr.netProfit
    }), { revenue: 0, cost: 0, expenses: 0, netProfit: 0 });

    return res.json(new ApiResponse(200, {
        summary: { ...totals, profitMargin: totals.revenue > 0 ? ((totals.netProfit / totals.revenue) * 100).toFixed(2) + "%" : "0%" },
        monthlyBreakdown
    }, "Report generated"));
});

// @desc    Get AI-generated financial insights (Scoped to shopId)
exports.getAIInsights = asyncHandler(async (req, res) => {
    const { summary, monthlyBreakdown } = req.body;

    const prompt = `Analyze this SaaS dashboard data for shop ${req.shopId}: ...`; // Simplified for brevity

    const response = await groq.chat.completions.create({
        model: "openai/gpt-oss-20b",
        messages: [{ role: "system", content: "Senior Financial Analyst" }, { role: "user", content: prompt }],
    });

    // Log usage
    await AIUsage.create({
        user: req.user._id,
        shopId: req.shopId,
        model: "openai/gpt-oss-20b",
        promptTokens: response.usage.prompt_tokens,
        completionTokens: response.usage.completion_tokens,
        totalTokens: response.usage.total_tokens,
        query: "Dashboard Financial Insights Generation"
    });

    return res.json(new ApiResponse(200, { insights: response.choices[0].message.content }, "Insights generated"));
});
// @desc    Get AI-generated financial insights directly from Sales data (GET)
exports.getAIInsightsDirect = asyncHandler(async (req, res) => {
    // Fetch all sales
    const sales = await Sale.find();

    if (!sales || sales.length === 0) {
        return res.json(new ApiResponse(200, { insights: "No sales data available yet to generate insights. Please add some sales first." }, "No data"));
    }

    // Calculate Totals
    let totalRevenue = 0;
    let totalExpenses = 0;
    let netProfit = 0;

    const dataDump = sales.map(s => `Product: ${s.productName}, Qty: ${s.quantity}, Revenue: ${s.price * s.quantity}, Cost: ${s.costPrice * s.quantity}, Profit: ${s.profit}`).join(' | ');

    // Prepare Exact Requested Prompt
    const prompt = `
Analyze this retail sales data and generate 5 business insights and recommendations to increase profit.

Data snapshot:
${dataDump.substring(0, 5000)} // Limiting size for API
    `;

    try {
        const response = await groq.chat.completions.create({
            model: "openai/gpt-oss-20b",
            messages: [
                { role: "user", content: prompt }
            ],
            temperature: 0.7,
        });

        const insights = response.choices[0].message.content;

        // Log AI usage (optional, omits shopId now)
        await AIUsage.create({
            user: req.user?._id,
            model: "openai/gpt-oss-20b",
            promptTokens: response.usage.prompt_tokens,
            completionTokens: response.usage.completion_tokens,
            totalTokens: response.usage.total_tokens,
            query: "Direct Sales Insights Generation"
        }).catch(err => console.error('AI Usage Log Error:', err.message));

        return res.json(new ApiResponse(200, { insights }, "Insights generated successfully"));
    } catch (openaiError) {
        console.error('OpenAI API Error:', openaiError.message);

        // Fallback to mock if API fails (e.g., Quota Exceeded)
        const fallbackInsights = `
[FALLBACK INSIGHTS - AI QUOTA EXCEEDED]
Analyze this retail sales data and generate 5 business insights and recommendations to increase profit:
1. Focus on top margin products.
2. Reduce overhead costs.
3. Bundle slow-moving inventory.
4. Improve cash flow via payment methods.
5. Create targeted customer discounts.
        `;

        return res.json(new ApiResponse(200, { insights: fallbackInsights }, "Insights generated via fallback (API Error)"));
    }
});
