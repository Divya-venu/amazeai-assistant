const express = require('express');
const router = express.Router();
const anomalyController = require('../controllers/anomalyDetectionController');
const cacheMiddleware = require('../middleware/cacheMiddleware');

/**
 * @route   POST /api/anomaly-detection
 * @desc    Detect anomalies in uploaded dataset
 * @access  Public
 */
router.post('/', cacheMiddleware(300), anomalyController.detectAnomalies);

module.exports = router;
