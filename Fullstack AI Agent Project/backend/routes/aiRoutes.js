const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

router.post('/forecast', aiController.getForecast);
router.post('/anomaly-detection', aiController.getAnomalies); // Renamed to match request
router.post('/insights', aiController.getInsights);
router.get('/results/:type', aiController.getResultsByType); // Added historical results route
router.get('/job/:jobId', aiController.checkJobStatus); // Polling endpoint

module.exports = router;
