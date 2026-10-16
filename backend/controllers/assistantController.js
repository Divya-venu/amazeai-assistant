const Groq = require('groq-sdk');
const Conversation = require('../models/Conversation');
const AIUsage = require('../models/AIUsage');
const { generateEmbedding, getRelevantContext } = require('../config/vectorDB');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');
const logger = require('../utils/logger');

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

// @desc    Process chat message with RAG and Usage Logging
// @route   POST /api/assistant/chat
exports.chatWithAssistant = asyncHandler(async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    // 1. RAG: Generate embedding for user message
    const queryEmbedding = await generateEmbedding(message);

    // 2. RAG: Retrieve relevant context
    const context = await getRelevantContext(queryEmbedding);

    const systemPrompt = `You are a professional retail business assistant. Use the following sales data context to help answer the user question if relevant:\n\n${context}`;

    // 3. Call OpenAI directly without Conversation memory per user since auth might be optional
    try {
        const response = await groq.chat.completions.create({
            model: "openai/gpt-oss-20b", // Use supported Groq model
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: message }
            ],
        });

        const assistantReply = response.choices[0].message.content;

        // 5. Log usage (optional, omits shopId now)
        await AIUsage.create({
            user: req.user?._id,
            model: response.model,
            promptTokens: response.usage.prompt_tokens,
            completionTokens: response.usage.completion_tokens,
            totalTokens: response.usage.total_tokens,
            query: message
        }).catch(err => console.error('AI Usage Log Error:', err.message));

        return res.json({ reply: assistantReply });
    } catch (apiError) {
        console.error('[AssistantController] AI Error:', apiError);
        if (apiError.status === 429) {
            logger.error(`OpenAI Quota Exceeded: ${apiError.message}`);
            return res.status(429).json({
                success: false,
                message: "AI Quota Exceeded. Please check your OpenAI billing or try again later.",
                error: "AI Quota Exceeded",
                reply: "I'm sorry, but my AI quota has been reached for now. Please contact support or check back later!"
            });
        }
        res.status(500).json({ error: "Failed to generate AI response" });
    }
});
