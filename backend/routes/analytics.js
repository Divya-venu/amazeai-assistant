const express = require('express');
const router = express.Router();
const { getAnalyticsOverview, postAnalytics } = require('../controllers/analyticsController');
const cacheMiddleware = require('../middleware/cacheMiddleware');

// Route: POST /api/analytics  — in-request analytics engine (O(n), no DB)
router.post('/', postAnalytics);

// Route: GET /api/analytics   — database-driven analytics overview (unchanged)
router.get('/', cacheMiddleware(300), getAnalyticsOverview);

module.exports = router;
