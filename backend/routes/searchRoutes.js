const express = require('express');
const router = express.Router();
const { getSalesSummary } = require('../controllers/saleController');

router.get('/', getSalesSummary);

module.exports = router;
