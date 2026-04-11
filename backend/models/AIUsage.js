const mongoose = require('mongoose');

const AIUsageSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    shopId: {
        type: String,
        index: true
    },
    model: {
        type: String,
        required: true
    },
    promptTokens: {
        type: Number,
        required: true
    },
    completionTokens: {
        type: Number,
        required: true
    },
    totalTokens: {
        type: Number,
        required: true
    },
    query: {
        type: String,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('AIUsage', AIUsageSchema);
