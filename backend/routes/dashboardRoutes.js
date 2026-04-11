const express = require('express');
const router = express.Router();
const { getMonthlyReport, getAIInsights } = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Get the monthly report (Admin only for financial data)
router.get('/monthly-report', protect, authorize('admin'), getMonthlyReport);

// Get AI Insights based on dashboard data
router.post('/ai-insights', protect, authorize('admin'), getAIInsights);

// Get AI Insights directly from sales data
router.get('/ai-insights', protect, authorize('admin'), require('../controllers/dashboardController').getAIInsightsDirect);

module.exports = router;
