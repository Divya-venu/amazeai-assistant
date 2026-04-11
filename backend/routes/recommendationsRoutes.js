const express = require('express');
const router = express.Router();
const { generateRecommendations } = require('../controllers/recommendationsController');
const { protect, authorize } = require('../middleware/authMiddleware');
const cacheMiddleware = require('../middleware/cacheMiddleware');

/**
 * @route   POST /api/ai-recommendations
 * @desc    Generate business recommendations using AI
 * @access  Private/Admin
 */
router.post('/', protect, authorize('admin'), cacheMiddleware(300), generateRecommendations);

module.exports = router;
