const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');

// Initialize Groq client
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// @route   POST /api/chat
// @desc    Ask AI a business question
// @access  Public (As per current request, though usually protected)
router.post('/', async (req, res) => {
    try {
        const { question, context } = req.body;

        if (!question) {
            return res.status(400).json({ error: 'Question is required' });
        }

        let systemPrompt = "You are a professional AI Business Assistant. Answer clearly and provide actionable insights.";
        if (context && context.stats) {
            systemPrompt += `\n\nCurrent Business Stats:
- Total Revenue: $${context.stats.totalRevenue.toLocaleString()}
- Total Expenses: $${context.stats.totalExpenses.toLocaleString()}
- Net Profit: $${context.stats.netProfit.toLocaleString()}
- Profit Margin: ${context.stats.profitMargin.toFixed(2)}%
If the user asks about revenue or performance, refer to these specific numbers.`;
        }

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: question }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
        });

        const reply = chatCompletion.choices[0]?.message?.content || "No response generated.";
        res.json({ reply });
    } catch (error) {
        console.error('[AI Chat Route Error]:', error.message);
        res.status(500).json({ error: 'Failed to get response from AI', details: error.message });
    }
});

module.exports = router;
