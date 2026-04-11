const express = require('express');
const router = express.Router();
const { processUserRequest } = require('../agents/aiAgent');

// @route POST /api/chat
// @desc Send a message to the OpenClaw Agent and return the AI Response
router.post('/', async (req, res) => {
    try {
        const { message } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Message payload is required' });
        }

        // Delegate entire process to the OpenClaw AI Agent
        const agentResult = await processUserRequest(message);

        res.status(200).json({
            reply: agentResult.reply,
            intent: agentResult.intent // Returning intent for UI debugging
        });

    } catch (error) {
        console.error("Chat Route Error:", error.message);
        res.status(500).json({ error: 'Internal Server Error while communicating with AI Agent' });
    }
});

module.exports = router;
