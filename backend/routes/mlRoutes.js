const express = require('express');
const router = express.Router();
const mlController = require('../controllers/mlController');

// GET /api/predictions
router.get('/', mlController.getPredictions);

module.exports = router;
