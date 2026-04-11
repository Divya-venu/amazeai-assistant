const express = require('express');
const router = express.Router();
const { getGlobalSales } = require('../controllers/globalSalesController');

// GET /api/global-sales - Get sales aggregated by country
router.get('/', getGlobalSales);

module.exports = router;
