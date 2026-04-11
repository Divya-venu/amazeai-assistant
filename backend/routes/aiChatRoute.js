const express = require('express');
const router = express.Router();

const { getChatCompletion } = require('../services/groqService');

const SYSTEM_PROMPT = `You are a helpful AI Business Assistant. Answer business-related questions clearly and concisely. Provide professional and actionable insights.`;

router.post('/', async (req, res) => {
    try {
        const { message } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        const reply = await getChatCompletion(SYSTEM_PROMPT, message);
        
        res.json({ reply });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

module.exports = router;
