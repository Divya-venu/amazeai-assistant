const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const UserSchema = new mongoose.Schema({
    role: String
});

const User = mongoose.model('User', UserSchema);

async function fixRoles() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ai_business_assistant');
        console.log('Connected to MongoDB');

        const result = await User.updateMany({}, { $set: { role: 'admin' } });
        console.log(`Updated ${result.modifiedCount} users to admin role.`);

        await mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error.message);
    }
}

fixRoles();
