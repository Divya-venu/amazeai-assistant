const express = require('express');
const router = express.Router();
const { createSale, getAllSales, seedSales, deleteSale, updateSale, getSalesSummary } = require('../controllers/saleController');
const cacheMiddleware = require('../middleware/cacheMiddleware');

router.post('/', createSale);
router.get('/', getAllSales);
router.get('/summary', cacheMiddleware(300), getSalesSummary);
router.post('/seed', seedSales);
router.delete('/:id', deleteSale);
router.put('/:id', updateSale);

module.exports = router;
