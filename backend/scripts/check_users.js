const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const users = await User.find({});
        console.log('Users found:', JSON.stringify(users.map(u => ({ email: u.email, role: u.role, shopId: u.shopId })), null, 2));
        process.exit(0);
    } catch (err) {
        process.exit(1);
    }
}
check();
