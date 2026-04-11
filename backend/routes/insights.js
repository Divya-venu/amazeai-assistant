const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');
const Sale = require('../models/Sale');
const cacheMiddleware = require('../middleware/cacheMiddleware');

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

/**
 * @route   POST /api/insights
 * @desc    Generate AI business insights from dataset or DB
 * @access  Public
 */
router.post('/', cacheMiddleware(300), async (req, res) => {
    try {
        let { dataset } = req.body;
        console.log(`[Backend Insights] Request received. Dataset array size: ${Array.isArray(dataset) ? dataset.length : 'N/A'}`);

        // If dataset is missing, empty, or just a wrapper for file names (sent by frontend)
        // fetch the latest data from DB to provide real analysis.
        const needsDbFetch = !dataset || 
                             (Array.isArray(dataset) && dataset.length === 0) ||
                             (typeof dataset === 'object' && dataset.files);

        if (needsDbFetch) {
            console.log('[AI Insights] Dataset is empty, fetching from DB...');
            dataset = await Sale.find().select('productName category price costPrice quantity date -_id').sort({ date: -1 }).limit(100);
        }

        if (!dataset || (Array.isArray(dataset) && dataset.length === 0)) {
            console.warn('[AI Insights] No data available even after DB fetch.');
            return res.status(400).json({ error: 'No data available for analysis. Please upload some CSV files first.' });
        }

        // Map dataset to a very concise format to save more tokens
        const cleanDataset = dataset.slice(0, 100).map(item => ({
            p: item.productName || 'N/A',
            c: item.category || 'N/A',
            pr: item.price || 0,
            cp: item.costPrice || 0,
            q: item.quantity || 1,
            d: item.date ? new Date(item.date).toISOString().split('T')[0] : ''
        }));

        console.log(`[AI Insights] Analyzing dataset with ${cleanDataset.length} records.`);

        const prompt = `
        Analyze the following business dataset and provide a structured financial report and recommendations.
        
        Dataset Summary (p=product, c=category, pr=price, cp=costPrice, q=qty, d=date):
        ${JSON.stringify(cleanDataset)}

        You MUST respond strictly in valid JSON format with the following structure:
        {
            "report": {
                "totalRevenue": "$",
                "totalExpenses": "$",
                "netProfit": "$",
                "profitMargin": "%",
                "topCategory": "Category Name"
            },
            "recommendations": [
                "Actionable recommendation 1",
                "Actionable recommendation 2",
                "Actionable recommendation 3"
            ],
            "summary": "A brief 2-sentence executive summary of business health."
        }
        Do not include any text outside the JSON block.
        `;

        const response_format = { type: "json_object" };
        
        try {
            console.log("[AI Insights] Calling Groq LLM...");
            const response = await groq.chat.completions.create({
                model: "llama-3.1-8b-instant",
                messages: [
                    { role: "system", content: "You are a senior financial analyst providing deep business intelligence. Output valid JSON only." },
                    { role: "user", content: prompt }
                ],
                temperature: 0.4,
                response_format
            });

            const insights = JSON.parse(response.choices[0].message.content);
            console.log("[AI Insights] Groq analysis successful.");
            res.json(insights);
        } catch (groqError) {
            console.error("[AI Insights] AI Call failed, providing fallback stats:", groqError.message);
            // Fallback: calculate basic stats from dataset
            const totalRevenue = dataset.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 0)), 0);
            const totalExpenses = dataset.reduce((sum, item) => sum + ((item.costPrice || 0) * (item.quantity || 0)), 0);
            res.json({
                report: {
                    totalRevenue: `$${totalRevenue.toFixed(2)}`,
                    totalExpenses: `$${totalExpenses.toFixed(2)}`,
                    netProfit: `$${(totalRevenue - totalExpenses).toFixed(2)}`,
                    profitMargin: `${((totalRevenue - totalExpenses) / totalRevenue * 100 || 0).toFixed(1)}%`,
                    topCategory: dataset[0]?.category || "General"
                },
                recommendations: [
                    "Manual audit of recently uploaded sales data is recommended.",
                    "Review cost-to-revenue ratios for low margin items.",
                    "AI Analysis is currently unavailable; results are calculated using standard formulas."
                ],
                summary: `Analysis performed on ${dataset.length} records. Business is generating ${totalRevenue > totalExpenses ? 'positive' : 'negative'} net profit.`
            });
        }
    } catch (error) {
        console.error('[AI Insights Error]:', error.message);
        res.status(500).json({ error: 'Failed to generate AI insights', details: error.message });
    }
});

module.exports = router;
