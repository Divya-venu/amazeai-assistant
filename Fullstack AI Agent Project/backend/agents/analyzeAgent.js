const { callGroqModel } = require('../services/groqService');

/**
 * OpenClaw Agent for File Analysis
 * 1. Takes parsed JSON data from a CSV upload.
 * 2. Compiles an analysis prompt enforcing the requested output structure.
 * 3. Calls the Groq AI model.
 * 4. Returns the structured insights.
 */
async function processCsvData(parsedData) {
    try {
        console.log(`[Analyze Agent] Received ${parsedData.length} rows of data.`);

        // Convert the JSON data subset to a string to pass to the prompt
        // To avoid token limits, we stringify the array. In a real prod environment, 
        // we'd summarize or slice if it's too large, but for this MVP, we pass it all.
        const dataContext = JSON.stringify(parsedData.slice(0, 100), null, 2);

        const systemPrompt = `You are a highly capable AI Financial Analyst.
        
        The user has uploaded raw sales/business data.
        You must analyze the provided data and return a highly structured business insight report.
        
        Use the following data context for your analysis (showing up to 100 rows):
        ---
        ${dataContext}
        ---
        
        You MUST format your output strictly with the following sections:
        
        # AI Financial Insights
        
        **Total Revenue**: [Calculate/Estimate total revenue based on data]
        **Top Selling Products**: [Identify top items]
        **Profit Margin**: [Estimate margin if possible, or note it]
        **Growth Trends**: [List 1 or 2 trends you observe]
        
        **Recommendations**:
        1. [Actionable advice 1]
        2. [Actionable advice 2]
        `;

        console.log(`[Analyze Agent] Requesting insights from Groq...`);
        
        const finalResponse = await callGroqModel([
            { role: "system", content: systemPrompt },
            { role: "user", content: "Analyze this uploaded data and give me the insights." }
        ]);

        return finalResponse;

    } catch (error) {
        console.error("[Analyze Agent] Error:", error.message);
        throw error;
    }
}

module.exports = { processCsvData };
