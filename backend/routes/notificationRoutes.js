const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');

// GET notification preferences
router.get('/', protect, async (req, res) => {
    try {
        res.json({
            success: true,
            notifications: req.user.notifications
        });
    } catch (error) {
        console.error('Get Notification Settings Error:', error);

        res.status(500).json({
            success: false,
            error: 'Failed to get notification settings'
        });
    }
});

// UPDATE notification preferences
router.put('/', protect, async (req, res) => {
    try {
        const {
            email,
            browser,
            salesAlerts,
            weeklyReport
        } = req.body;

        const user = await User.findByIdAndUpdate(
            req.user._id,
            {
                notifications: {
                    email: Boolean(email),
                    browser: Boolean(browser),
                    salesAlerts: Boolean(salesAlerts),
                    weeklyReport: Boolean(weeklyReport)
                }
            },
            {
                new: true,
                runValidators: true
            }
        );

        res.json({
            success: true,
            message: 'Notification settings updated successfully',
            notifications: user.notifications
        });

    } catch (error) {
        console.error('Update Notification Settings Error:', error);

        res.status(500).json({
            success: false,
            error: 'Failed to update notification settings'
        });
    }
});

module.exports = router;