const User = require('../models/User');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/signup
 * @access  Public
 */
exports.signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // 1. Validate input
        if (!name || !email || !password) {
            return res.status(400).json({ 
                success: false, 
                error: 'Please provide name, email, and password.' 
            });
        }

        // 2. Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ 
                success: false, 
                error: 'An account with this email already exists.' 
            });
        }

        // 3. Create the user
        // The password will automatically be hashed by the mongoose 'pre-save' hook in User.js
        const user = await User.create({
            name,
            email,
            password
        });

        // 4. Return success response (excluding password)
        res.status(201).json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt
            },
            message: 'User registered successfully'
        });

    } catch (error) {
        console.error('[Signup Error]:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message || 'Server Error' 
        });
    }
};
