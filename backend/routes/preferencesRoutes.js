const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');

// GET language & region preferences
router.get('/', protect, async (req, res) => {
    try {
        res.json({
            success: true,
            preferences: {
                language: req.user.language,
                timeZone: req.user.timeZone
            }
        });
    } catch (error) {
        console.error('Get Preferences Error:', error);

        res.status(500).json({
            success: false,
            error: 'Failed to get preferences'
        });
    }
});

// UPDATE language & region preferences
router.put('/', protect, async (req, res) => {
    try {
        const { language, timeZone } = req.body;

        if (!language || !timeZone) {
            return res.status(400).json({
                success: false,
                error: 'Language and time zone are required'
            });
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            {
                language,
                timeZone
            },
            {
                new: true,
                runValidators: true
            }
        );

        res.json({
            success: true,
            message: 'Language & Region updated successfully',
            preferences: {
                language: user.language,
                timeZone: user.timeZone
            }
        });

    } catch (error) {
        console.error('Update Preferences Error:', error);

        res.status(500).json({
            success: false,
            error: 'Failed to update preferences'
        });
    }
});

module.exports = router;