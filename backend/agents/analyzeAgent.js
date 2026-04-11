const { getChatCompletion } = require('../services/groqService');

async function analyzeDataWithAgent(parsedData) {
    const dataContext = JSON.stringify(parsedData.slice(0, 100), null, 2);

    const systemPrompt = `You are an expert AI Financial Analyst.
    The user has uploaded raw sales data. You must analyze the data and return structured insights.
    
    Data Context (up to 100 rows):
    ---
    ${dataContext}
    ---
    
    You MUST output strictly in the following format:
    
    # AI Financial Insights
    **Total Revenue**: [Calculate/estimate total revenue]
    **Top Selling Products**: [Identify top items]
    **Profit Margin**: [Estimate margin if possible]
    **Growth Trends**: [List 1 or 2 trends observed]
    
    **Recommendations**:
    1. [Actionable advice 1]
    2. [Actionable advice 2]
    `;

    // Use the getChatCompletion method from groqService to handle model versioning and robust error logs
    return await getChatCompletion(systemPrompt, "Analyze this uploaded data.");
}

module.exports = { analyzeDataWithAgent };
