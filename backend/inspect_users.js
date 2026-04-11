const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    role: String,
    shopId: String
});

const User = mongoose.model('User', UserSchema);

async function inspectUsers() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ai_business_assistant');
        console.log('Connected to MongoDB');

        const users = await User.find({});
        console.log('Users found:', users.length);
        users.forEach(u => {
            console.log(`- ${u.email}: role=${u.role}, shopId=${u.shopId}`);
        });

        await mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error.message);
    }
}

inspectUsers();
