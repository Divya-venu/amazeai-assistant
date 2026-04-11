const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        index: true
    },
    price: {
        type: Number,
        required: [true, 'Selling price is required'],
        min: 0
    },
    costPrice: {
        type: Number,
        required: [true, 'Cost price is required'],
        min: 0
    },
    stock: {
        type: Number,
        required: [true, 'Stock quantity is required'],
        default: 0
    },
    shopId: {
        type: String,
        required: [true, 'Shop ID is required'],
        index: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Product', ProductSchema);
