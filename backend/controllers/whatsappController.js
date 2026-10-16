const Groq = require('groq-sdk');
const WhatsAppConversation = require('../models/WhatsAppConversation');
const { getRelevantContext } = require('../config/vectorDB');
const { generateEmbedding } = require('../services/embeddingService');
const axios = require('axios');
const WhatsAppContact = require('../models/WhatsAppContact');
const {
    getHighestProfitProduct
} = require('../services/businessAnalyticsService');

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

                const whatsappContact = await WhatsAppContact.findOne({
    phoneNumber: from,
    isActive: true
});

if (!whatsappContact) {
    console.log(`No WhatsApp contact found for ${from}`);
    return;
}

const shopId = whatsappContact.shopId;

console.log(`WhatsApp user ${from} belongs to shop: ${shopId}`);

                console.log(`Received WhatsApp message from ${from}: ${msg_body}`);

                // Find or create a conversation for this WhatsApp contact and shop.
let conversation = await WhatsAppConversation.findOne({
    phoneNumber: from,
    shopId: shopId
});

if (!conversation) {
    conversation = await WhatsAppConversation.create({
        phoneNumber: from,
        shopId: shopId,
        messages: []
    });
}

// Save the incoming user message.
conversation.messages.push({
    role: 'user',
    content: msg_body
});

conversation.lastMessageAt = new Date();

await conversation.save();

// Keep only the most recent 10 messages for the AI prompt.
const conversationHistory = conversation.messages
    .slice(-10)
    .map(message => ({
        role: message.role,
        content: message.content
    }));


                // 1. RAG Retrieve Context
                const queryEmbedding = await generateEmbedding(msg_body);
                const context = await getRelevantContext(queryEmbedding, shopId);

                const highestProfitProduct = await getHighestProfitProduct(shopId);

let exactBusinessData = '';

if (highestProfitProduct) {
    const sellingPrice = highestProfitProduct.price || 0;
    const costPrice = highestProfitProduct.costPrice || 0;
    const quantity = highestProfitProduct.quantity || 0;

    const profitPerUnit = sellingPrice - costPrice;
    const totalProfit = profitPerUnit * quantity;

    exactBusinessData = `
Highest Profit Product:
Product: ${highestProfitProduct.productName}
Selling Price Per Unit: ₹${sellingPrice}
Cost Price Per Unit: ₹${costPrice}
Profit Per Unit: ₹${profitPerUnit}
Quantity Sold: ${quantity}
Total Profit: ₹${totalProfit}
`;
}

                // 2. Query OpenAI
               const prompt = `You are a professional business assistant for a shop owner on WhatsApp.

Rules:
1. Answer using the business data provided below and conversation history.
2. Do not invent sales, products, prices, costs, profits, or other business facts.
3. Answer the specific question asked. Do not answer with profit when the user asks for cost.
4. If the user says "it", "that product", or similar phrases, use conversation history to identify the product.
5. For exact numerical questions, prefer the Exact Business Data.
6. Use the Retrieved Sales Context for additional information.
7. If the requested information is unavailable, clearly say so.
8. Keep answers brief and friendly.
9. Use Indian Rupees (₹) for monetary values.

Exact Business Data:
${exactBusinessData}

Retrieved Sales Context:
${context}`;

                // 2. Send business context and conversation history to Groq
const response = await groq.chat.completions.create({
    model: "openai/gpt-oss-20b",
    messages: [
        {
            role: 'system',
            content: prompt
        },
        ...conversationHistory
    ]
});

                const replyText = response.choices[0].message.content;

                // Save the assistant's reply to conversation history
conversation.messages.push({
    role: 'assistant',
    content: replyText
});

conversation.lastMessageAt = new Date();

// Keep only the latest 50 messages in MongoDB
if (conversation.messages.length > 50) {
    conversation.messages = conversation.messages.slice(-50);
}

await conversation.save();

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
