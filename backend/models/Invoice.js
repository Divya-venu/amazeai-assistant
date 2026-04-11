const mongoose = require('mongoose');

const InvoiceSchema = new mongoose.Schema({
    invoiceNumber: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    customerName: {
        type: String,
        required: [true, 'Customer name is required'],
        trim: true
    },
    items: [
        {
            productName: String,
            quantity: Number,
            price: Number,
            total: Number
        }
    ],
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    shopId: {
        type: String,
        required: [true, 'Shop ID is required'],
        index: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Invoice', InvoiceSchema);
