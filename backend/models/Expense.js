const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Expense title is required'],
        trim: true
    },
    amount: {
        type: Number,
        required: [true, 'Expense amount is required'],
        min: 0
    },
    category: {
        type: String,
        required: [true, 'Expense category is required'],
        index: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    shopId: {
        type: String,
        required: [true, 'Shop ID is required'],
        index: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Expense', ExpenseSchema);
