const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

/**
 * SaaS AI Routes
 * - /forecast and /anomalies are protected (require JWT, use shopId scoping)
 * - /insights is public so the CSV upload pipeline can call it without auth
 */

router.post('/forecast', protect, aiController.getForecast);
router.post('/anomalies', protect, aiController.getAnomalies);
router.post('/insights', aiController.getInsights); // Public — called by InsightsUploader after CSV upload

module.exports = router;
