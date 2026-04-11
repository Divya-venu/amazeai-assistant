const Groq = require('groq-sdk');
require('dotenv').config();

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

/**
 * Generate Business Insights using Groq LLM
 */
const generateInsights = async (data) => {
    try {
        const prompt = `
ROLE:
You are a senior AI Business Intelligence analyst.

TASK:
Analyze the following JSON business data.

OUTPUT FORMAT:
Executive Summary:
• Insight 1
• Insight 2
• Insight 3

Key Recommendation:
• Actionable business recommendation.

RULES:
- No greetings
- No filler
- Maximum 120 words
- Focus on trends, anomalies, and opportunities

DATA:
${JSON.stringify(data)}
        `;

        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.1-8b-instant',
            response_format: { type: 'json_object' }
        });

        return JSON.parse(chatCompletion.choices[0].message.content);
    } catch (error) {
        console.error('[GroqService] Error:', error);
        throw new Error('Failed to generate AI insights');
    }
};

module.exports = { generateInsights };
