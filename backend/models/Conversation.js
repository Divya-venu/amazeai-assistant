const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    messages: [
        {
            role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
            content: { type: String, required: true },
            timestamp: { type: Date, default: Date.now }
        }
    ]
}, { timestamps: true });

module.exports = mongoose.model('Conversation', ConversationSchema);
