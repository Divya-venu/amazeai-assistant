const mongoose = require('mongoose');

const AIResultSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['forecast', 'anomaly', 'insights', 'recommendations'],
        required: true,
        index: true
    },
    shopId: {
        type: String,
        required: true,
        index: true
    },
    inputHash: {
        type: String,
        required: true,
        index: true
    },
    result: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    // TTL index: Documents will be automatically deleted after 24 hours
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        index: { expires: 0 }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('AIResult', AIResultSchema);
