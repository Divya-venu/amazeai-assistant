/**
 * @route POST /api/upload-csv
 * @desc  Stream-parse a CSV file and return inline analytics JSON.
 *        File-type guard and 50MB size limit enforced by uploadSingle middleware.
 */
const express = require('express');
const router  = express.Router();
const { uploadSingle }     = require('../middleware/uploadMiddleware');
const { uploadAndAnalyse } = require('../controllers/csvStreamController');

router.post('/', uploadSingle, uploadAndAnalyse);

module.exports = router;
