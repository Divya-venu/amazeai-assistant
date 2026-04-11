const express = require('express');
const router = express.Router();
const { getRelevantContext } = require('../config/vectorDB');
const { classifyIntent, getChatCompletion } = require('../services/groqService');

// @route POST /api/chat
// @desc Process user chat message and optionally return chart data
router.post('/', async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) return res.status(400).json({ error: 'Message is required' });

        // Step 1: Understand the user request & Step 2: Decide the action
        console.log(`[Chat API] Received message: "${message}"`);
        let intent;
        try {
            intent = await classifyIntent(message);
            console.log(`[Agent Intent Logger] Evaluated Intent: ${intent}`);
        } catch (intentError) {
            console.error("[Chat API Error] Intent classification failed:", intentError.message);
            // Fallback to "GENERAL" if classification fails
            intent = "GENERAL";
        }

        // Step 3: Fetch database data (if required)
        let context = "";
        let finalSystemPrompt = "";

        if (intent === 'DATA' || intent === 'BOTH') {
            try {
                // Fetch relevant business data context via RAG
                context = await getRelevantContext(message);
                
                finalSystemPrompt = `You are an AI business assistant that analyzes user requests and provides insights. 
                Step 4: Analyze the data. 
                Use the following business data context to answer the user: 
                ---
                ${context}
                ---
                Step 5: Return the response.
                You MUST format your answer clearly and professionally.
                If the request relates to sales performance or data analysis, you must strictly structure your response with the following sections (unless irrelevant):
                
                Sales Performance Analysis
                Overview: [1-2 sentences]
                
                Key Insights:
                • Top Selling Product: ...
                • Total Revenue: ...
                • [Other relevant stats]...
                
                Trends:
                - ...
                - ...
                
                Recommendations:
                1. ...
                2. ...
                3. ...
                
                Conclusion: [Short conclusion]
                
                If the user asks for a chart, graph, or visual data representation, you MUST reply with a valid JSON block embedded in your text formatted like this:
                \`\`\`json
                {
                  "type": "bar",
                  "labels": ["Jan", "Feb", "Mar"],
                  "datasetLabel": "Sales",
                  "data": [10, 20, 30]
                }
                \`\`\`
                Keep normal chat responses conversational but concise if they do not require this structure.`;
                
            } catch(e) { 
                console.error("[Chat API Error] RAG context error:", e.message); 
                // Fallback to general reasoning if RAG fails
                finalSystemPrompt = `You are an AI business assistant. The system failed to retrieve business data context. Please notify the user briefly about the system error and answer as best as you can with general knowledge.`;
            }
        } else {
            // General Knowledge Path
            finalSystemPrompt = `You are an AI business assistant that analyzes user requests and provides insights. Step 5: Return the response. Provide a clear, structured, and professional answer. You do not have business data for this query, so answer based on general knowledge.`;
        }

        // Final Execution (Step 4 / Step 5)
        let replyRaw;
        try {
            replyRaw = await getChatCompletion(finalSystemPrompt, message);
        } catch (chatError) {
             console.error("[Chat API Error] Chat completion failed:", chatError.message);
             return res.status(500).json({ error: "AI Agent Groq - Failed to process chat request.", details: chatError.message });
        }

        // Try to parse out JSON chart configuration
        let chartData = null;
        let textReply = replyRaw;
        
        try {
            const jsonMatch = replyRaw.match(/```json\s*(\{[\s\S]*?\})\s*```/);
            if (jsonMatch && jsonMatch[1]) {
                chartData = JSON.parse(jsonMatch[1]);
                textReply = replyRaw.replace(jsonMatch[0], "").trim();
            }
        } catch (parseError) {
            console.error("[Chat API Default] Failed to parse chart JSON from LLM:", parseError.message);
        }

        res.status(200).json({ 
            reply: textReply,
            chartData: chartData,
            agentIntent: intent // Returning intent for debugging/visibility
        });

    } catch (error) {
        console.error("[Chat API Root Error]:", error.message);
        res.status(500).json({ error: "AI Agent - Internal Server Error", details: error.message });
    }
});

module.exports = router;
