const express = require('express');
const router = express.Router();
const { getSmartAlerts } = require('../controllers/smartAlertsController');
const { protect, authorize } = require('../middleware/authMiddleware');

/**
 * @route   GET /api/smart-alerts
 * @desc    Get smart business alerts
 * @access  Private/Admin
 */
router.get('/', protect, authorize('admin'), getSmartAlerts);

module.exports = router;
