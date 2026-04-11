const mongoose = require('mongoose');

const DatasetSchema = new mongoose.Schema({
    datasetId: {
        type: String,
        required: true,
        index: true
    },
    // The raw row data as key-value pairs
    data: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    // The inferred schema for this row (could also be stored once per dataset, but we'll attach metadata for easy querying)
    schemaMeta: {
        metrics: [String],    // e.g. ['revenue', 'cost', 'impressions']
        dimensions: [String], // e.g. ['category', 'country']
        timeColumn: String    // e.g. 'date'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    strict: false // allow arbitrary fields
});

module.exports = mongoose.model('Dataset', DatasetSchema);
