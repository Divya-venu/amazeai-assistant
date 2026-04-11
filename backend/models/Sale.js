const mongoose = require('mongoose');

const SaleSchema = new mongoose.Schema({
    productName: {
        type: String,
        required: [true, 'Product name is required'],
        index: true
    },
    category: {
        type: String,
        required: [true, 'Category is required']
    },
    price: {
        type: Number,
        required: [true, 'Price is required']
    },
    costPrice: {
        type: Number,
        required: [true, 'Cost Price is required']
    },
    quantity: {
        type: Number,
        required: [true, 'Quantity is required'],
        min: 1
    },
    profit: {
        type: Number,
        default: 0
    },
    customerName: {
        type: String,
        default: 'Guest'
    },
    paymentMethod: {
        type: String,
        enum: ['UPI', 'Cash', 'Card', 'Credit'],
        default: 'Cash'
    },
    date: {
        type: Date,
        default: Date.now,
        index: true
    },
    shopId: {
        type: String,
        index: true
    },
    country: {
        type: String,
        default: 'Unknown',
        index: true
    },
    // Vector data for RAG (Retrieval-Augmented Generation)
    embedding: {
        type: [Number],
        default: []
    }
}, {
    timestamps: true
});

// Calculate profit before saving
SaleSchema.pre('save', function(next) {
    if (this.isModified('price') || this.isModified('costPrice') || this.isModified('quantity')) {
        this.profit = (this.price - this.costPrice) * this.quantity;
    }
    next();
});

module.exports = mongoose.model('Sale', SaleSchema);
