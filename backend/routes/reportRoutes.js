const express = require('express');
const router = express.Router();
const { generateBusinessReport, getReports, getReportById, downloadReportCSV } = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Legacy route for PDF generation
router.get('/generate', protect, authorize('admin'), generateBusinessReport);

// New dynamic reports routes
router.get('/', getReports);
router.get('/:id', getReportById);
router.get('/:id/download', downloadReportCSV);

module.exports = router;
