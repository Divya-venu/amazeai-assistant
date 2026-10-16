const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');

// Get logged-in user's profile
router.get('/', protect, async (req, res) => {
    try {
        res.json({
            success: true,
            user: {
                name: req.user.name,
                email: req.user.email
            }
        });
    } catch (error) {
        console.error('Get Profile Error:', error);

        res.status(500).json({
            success: false,
            error: 'Failed to get profile'
        });
    }
});

// Update logged-in user's profile
router.put('/', protect, async (req, res) => {
    try {
        const { name, email } = req.body;

        if (!name || !email) {
            return res.status(400).json({
                success: false,
                error: 'Name and email are required'
            });
        }

        const existingUser = await User.findOne({
            email,
            _id: { $ne: req.user._id }
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: 'Email is already in use'
            });
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            {
                name,
                email
            },
            {
                new: true,
                runValidators: true
            }
        );

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Update Profile Error:', error);

        res.status(500).json({
            success: false,
            error: 'Failed to update profile'
        });
    }
});

module.exports = router;