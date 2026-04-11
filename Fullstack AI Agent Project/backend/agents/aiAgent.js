const { callGroqModel } = require('../services/groqService');

// Mock data to represent business data fetched from a database
const MOCK_SALES_DATA = `
Recent Sales Data Overview:
- Total Revenue (This Month): ₹48,000
- Top Selling Product: Shirts
- Growth Rate: +12% compared to last month
- Demographics: High demand in casual wear
- Weekend sales are 30% higher than weekday sales.
`;

/**
 * OpenClaw Agent Process
 * 1. Understand Request
 * 2. Classify Intent (General vs Data)
 * 3. Fetch Data (if needed)
 * 4. Generate AI Response
 * 5. Return Response
 */
async function processUserRequest(userMessage) {
    try {
        console.log(`[OpenClaw Agent] Processing: "${userMessage}"`);

        // Step 1 & 2: Classify Intent
        const classificationPrompt = `Analyze the user's request: "${userMessage}"
        Is the user asking for business data/sales analysis, or general knowledge?
        Respond with ONLY one word: "DATA" or "GENERAL".`;
        
        const intentRaw = await callGroqModel([{ role: "user", content: classificationPrompt }]);
        const intent = intentRaw.trim().toUpperCase();
        console.log(`[OpenClaw Agent] Classified Intent: ${intent}`);

        let finalSystemPrompt = "";

        if (intent.includes("DATA")) {
            // Step 3: Fetch Data (Mocked here)
            console.log(`[OpenClaw Agent] Fetching Business Data...`);
            
            finalSystemPrompt = `You are an AI business assistant that analyzes user requests and provides insights.
            Use the following business data context to answer the user:
            ---
            ${MOCK_SALES_DATA}
            ---
            You MUST format your answer clearly and professionally.
            Since this request relates to sales performance or data analysis, strictly structure your response with these sections:
            
            Sales Analysis:
            Revenue: ...
            Top Product: ...
            Growth: ...
            Recommendation: ...
            
            Conclusion: ...
            `;
        } else {
            // General Knowledge Path
            finalSystemPrompt = `You are a helpful AI Business Assistant. Answer the user's general query clearly and professionally. You do not currently have specific business data attached to this query.`;
        }

        // Step 4: Generate Final Response
        console.log(`[OpenClaw Agent] Generating reasoning with llama-3.1-8b-instant...`);
        const finalResponse = await callGroqModel([
            { role: "system", content: finalSystemPrompt },
            { role: "user", content: userMessage }
        ]);

        // Step 5: Return
        return {
            reply: finalResponse,
            intent: intent
        };

    } catch (error) {
        console.error("[OpenClaw Agent] Error:", error.message);
        throw error;
    }
}

module.exports = { processUserRequest };
