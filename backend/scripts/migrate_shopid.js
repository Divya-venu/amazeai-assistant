const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Sale = require('../models/Sale');

async function migrate() {
    try {
        if (!process.env.MONGO_URI) {
            console.error('MONGO_URI not found in .env');
            process.exit(1);
        }

        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        let user = await User.findOne({ email: 'admin@example.com' });
        if (!user) {
            user = await User.findOne({ role: 'admin' });
        }

        if (!user) {
            console.error('No admin user found.');
            process.exit(1);
        }

        if (!user.shopId) {
            console.log('Admin missing shopId, assigning "test-shop-123"');
            user.shopId = 'test-shop-123';
            await user.save();
        }

        const shopId = user.shopId;
        console.log(`Target ShopID: ${shopId}`);

        const res = await Sale.updateMany(
            {}, // Update ALL sales for this optimization/migration
            { $set: { shopId: shopId } }
        );

        console.log(`Migration complete. Updated ${res.modifiedCount} sales with shopId: ${shopId}`);
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
