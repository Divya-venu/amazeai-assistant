const Groq = require('groq-sdk');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

/**
 * @desc    Generate AI Business Recommendations
 * @route   POST /api/ai-recommendations
 * @access  Private/Admin
 */
exports.generateRecommendations = asyncHandler(async (req, res) => {
    const { dataset } = req.body;

    if (!dataset) {
        return res.status(400).json(new ApiResponse(400, null, "Dataset is required"));
    }

    const prompt = `
    Analyze the following business dataset and generate exactly 5 clear, actionable improvement suggestions to increase profit, reduce expenses, and optimize operations.
    
    Data Summary:
    ${JSON.stringify(dataset).substring(0, 5000)}

    Format the response as a simple JSON array of strings, like this:
    ["Suggestion 1", "Suggestion 2", "Suggestion 3", "Suggestion 4", "Suggestion 5"]
    
    Respond ONLY with the JSON array.
    `;

    try {
        const response = await groq.chat.completions.create({
            model: "openai/gpt-oss-20b",
            messages: [
                { role: "system", content: "You are a Senior Business Consultant and Financial Analyst." },
                { role: "user", content: prompt }
            ],
            temperature: 0.7,
        });

        let content = response.choices[0].message.content.trim();
        
        // Handle cases where the model might include markdown code blocks
        if (content.startsWith('```')) {
            content = content.replace(/```json|```/g, '').trim();
        }

        const recommendations = JSON.parse(content);

        return res.json(new ApiResponse(200, { recommendations }, "Recommendations generated successfully"));
    } catch (error) {
        console.error('Groq AI Error:', error.message);
        
        // Fallback recommendations if AI fails
        const fallback = [
            "Increase marketing for high-margin electronics category",
            "Reduce inventory for low performing products to free up cash",
            "Optimize marketing strategies for upcoming Q2 seasonal peak",
            "Increase focus on high-profit luxury product lines",
            "Reduce spending on low ROI digital marketing campaigns"
        ];

        return res.json(new ApiResponse(200, { recommendations: fallback }, "Recommendations generated via fallback (AI Error)"));
    }
});
