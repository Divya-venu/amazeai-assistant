const Groq = require('groq-sdk');
const { generateEmbedding, getRelevantContext } = require('../config/vectorDB');
const axios = require('axios');

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

exports.verifyWebhook = (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token) {
        if (mode === 'subscribe' && token === (process.env.WHATSAPP_VERIFY_TOKEN || 'my_verify_secret')) {
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);
        }
    } else {
        res.sendStatus(400);
    }
};

exports.receiveMessage = async (req, res) => {
    // Return 200 early to prevent WhatsApp from retrying
    res.status(200).send('EVENT_RECEIVED');

    try {
        const body = req.body;
        if (body.object) {
            const entry = body.entry?.[0];
            const changes = entry?.changes?.[0];
            const value = changes?.value;
            const messages = value?.messages;

            if (messages && messages[0]) {
                const phone_number_id = value.metadata.phone_number_id;
                const from = messages[0].from;
                const msg_body = messages[0].text?.body;

                if (!msg_body) return;

                console.log(`Received WhatsApp message from ${from}: ${msg_body}`);

                // 1. RAG Retrieve Context
                const queryEmbedding = await generateEmbedding(msg_body);
                const context = await getRelevantContext(queryEmbedding);

                // 2. Query OpenAI
                const prompt = `You are a professional business assistant for a shop owner on WhatsApp.
Keep your answers brief, friendly, and actionable. Don't use markdown formatting that isn't supported by WhatsApp.
Sales Context:
${context}`;

                const response = await groq.chat.completions.create({
                    model: "llama-3.1-8b-instant",
                    messages: [
                        { role: 'system', content: prompt },
                        { role: 'user', content: msg_body }
                    ]
                });

                const replyText = response.choices[0].message.content;

                // 3. Send WhatsApp Reply
                if (process.env.WHATSAPP_TOKEN) {
                    await axios({
                        method: 'POST',
                        url: `https://graph.facebook.com/v17.0/${phone_number_id}/messages`,
                        headers: {
                            Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
                            'Content-Type': 'application/json'
                        },
                        data: {
                            messaging_product: 'whatsapp',
                            to: from,
                            text: { body: replyText },
                        }
                    });
                } else {
                    console.log(`[WhatsApp Simulation] Reply to ${from}: ${replyText}`);
                }
            }
        }
    } catch (error) {
        console.error('WhatsApp Webhook Error:', error.message);
    }
};
