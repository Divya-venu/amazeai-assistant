const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    type: {
        type: String,
        enum: ['Financial', 'Sales', 'Analytics', 'Technical'],
        default: 'Financial',
    },
    status: {
        type: String,
        enum: ['Generated', 'Ready', 'Archived', 'Failed'],
        default: 'Ready',
    },
    summaryData: {
        totalRevenue: { type: Number, default: 0 },
        totalOrders: { type: Number, default: 0 },
        uniqueCustomers: { type: Number, default: 0 },
        avgOrderValue: { type: Number, default: 0 },
    },
    fileReference: {
        type: String,
        default: null, // Could store the path to the original CSV, if we kept it
    }
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);
