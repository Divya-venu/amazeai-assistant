const express = require('express');
const router = express.Router();

const Sale = require('../models/Sale');
const { getChatCompletion } = require('../services/groqService');

router.post('/', async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({
                error: 'Message is required'
            });
        }

        // Get actual sales data from MongoDB
        const sales = await Sale.find().lean();

        // Calculate total revenue
        const totalRevenue = sales.reduce(
            (sum, sale) => sum + (sale.price * sale.quantity),
            0
        );

        // Calculate total expenses
        const totalExpenses = sales.reduce(
            (sum, sale) => sum + (sale.costPrice * sale.quantity),
            0
        );

        // Calculate total profit
        const totalProfit = totalRevenue - totalExpenses;

        // Calculate profit margin
        const profitMargin = totalRevenue > 0
            ? ((totalProfit / totalRevenue) * 100).toFixed(1)
            : 0;

        // Business data sent to AI
        const salesWithProfit = sales.map(sale => ({
    ...sale,
    profit:
        ((sale.price || 0) - (sale.costPrice || 0)) *
        (sale.quantity || 0)
}));

const businessData = {
    recordCount: sales.length,
    totalRevenue,
    totalExpenses,
    totalProfit,
    profitMargin: `${profitMargin}%`,
    sales: salesWithProfit
};

        const SYSTEM_PROMPT = `
You are an AI Business Assistant.

Answer the user's question using ONLY the actual business data provided below.

IMPORTANT RULES:
1. Do not invent business data.
2. Do not create fake sales, products, categories, dates, percentages, or trends.
3. If the answer can be calculated from the provided data, calculate it accurately.
4. Use Indian Rupees (₹) for monetary values.
5. Keep answers clear and concise.
6. If the required information is not available, say that the data is not available.
7. When answering numerical questions, use the actual values from the business data.

ACTUAL BUSINESS DATA:
${JSON.stringify(businessData, null, 2)}
`;

        // Send the user's question + actual MongoDB data to Groq
        const reply = await getChatCompletion(
            SYSTEM_PROMPT,
            message
        );

        res.json({
            reply,
            dataUsed: {
                recordCount: sales.length,
                totalRevenue,
                totalExpenses,
                totalProfit,
                profitMargin: `${profitMargin}%`
            }
        });

    } catch (error) {
        console.error('❌ AI Chat Error:', error);

        res.status(500).json({
            error: 'Internal Server Error',
            details: error.message
        });
    }
});

module.exports = router;