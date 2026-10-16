const mongoose = require('mongoose');

const WhatsAppConversationSchema = new mongoose.Schema(
    {
        phoneNumber: {
            type: String,
            required: true,
            index: true
        },

        shopId: {
            type: String,
            required: true,
            index: true
        },

        messages: [
            {
                role: {
                    type: String,
                    enum: ['user', 'assistant'],
                    required: true
                },

                content: {
                    type: String,
                    required: true
                },

                timestamp: {
                    type: Date,
                    default: Date.now
                }
            }
        ],

        lastMessageAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

// One conversation per WhatsApp contact per shop.
WhatsAppConversationSchema.index(
    { phoneNumber: 1, shopId: 1 },
    { unique: true }
);

module.exports = mongoose.model(
    'WhatsAppConversation',
    WhatsAppConversationSchema
);