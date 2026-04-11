const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Define auth routes
router.post('/signup', authController.signup);

module.exports = router;
