const Groq = require('groq-sdk');

// Ensure API key is loaded from environment
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * Classifies the user's intent to decide whether context is needed.
 */
async function classifyIntent(message) {
    const classificationPrompt = `Analyze the following user request and classify its intent into one of three categories:
    1. "GENERAL" - General knowledge, chat, or AI questions not requiring business data.
    2. "DATA" - Requests for specific sales numbers, database records, analytics, or charts.
    3. "BOTH" - Requests wanting analysis, trends, or insights based on business data.
    
    Respond ONLY with the exact word: GENERAL, DATA, or BOTH.
    User Request: "${message}"`;

    try {
        const intentResponse = await groq.chat.completions.create({
            model: "llama-3.1-8b-instant", // Keep it fast for intent classification
            messages: [{ role: "user", content: classificationPrompt }],
            temperature: 0.1
        });
        
        return intentResponse.choices[0].message.content.trim().toUpperCase();
    } catch (error) {
        if (error.status === 401) {
             console.error("\n[CRITICAL GROQ ERROR]: Your API Key is Invalid or Missing.\n");
        } else {
             console.error("\n[RAW GROQ ERROR (Intent)]:", error.message);
        }
        throw new Error("Failed to communicate with Groq AI for intent classification.");
    }
}

/**
 * Sends a structured prompt to the Groq Llama model for a main response.
 */
async function getChatCompletion(systemPrompt, userMessage) {
    try {
        const response = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile", // Upgraded model for better responses
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userMessage }
            ],
            temperature: 0.7
        });
        
        return response.choices[0].message.content;
    } catch (error) {
        if (error.status === 401) {
             console.error("\n[CRITICAL GROQ ERROR]: Your API Key is Invalid or Missing.\n");
        } else {
             console.error("\n[RAW GROQ ERROR (Chat)]:", error.message);
        }
        throw new Error("Failed to communicate with Groq AI for chat completion.");
    }
}

module.exports = { classifyIntent, getChatCompletion };
