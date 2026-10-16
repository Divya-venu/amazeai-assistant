const express = require('express');
const router = express.Router();
const { getForecast, postForecast } = require('../controllers/forecastController');
const cacheMiddleware = require('../middleware/cacheMiddleware');

router.get('/', getForecast);
router.post('/', postForecast);

module.exports = router;
