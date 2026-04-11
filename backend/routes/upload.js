const express = require("express");
const router = express.Router();
const { uploadSingle } = require("../middleware/uploadMiddleware");
const { handleUpload } = require("../controllers/uploadController");
const Dataset = require("../models/Dataset"); // needed by GET /download-cleaned

/**
 * @route POST /api/upload
 * @desc  Upload a CSV file, parse it into JSON, persist and return results.
 *        File-type validation, size limits, and temp-file cleanup are all
 *        handled by the middleware and controller layers.
 */
router.post("/", uploadSingle, handleUpload);

const { Parser } = require("json2csv");

/**
 * @route   GET /api/upload/download-cleaned
 * @desc    Download the last ingested dataset in cleaned format
 */
router.get("/download-cleaned", async (req, res) => {
    try {
        const datasets = await Dataset.find().limit(5000); // Limit for safety
        if (datasets.length === 0) {
            return res.status(404).json({ error: "No cleaned data available." });
        }

        const json2csvParser = new Parser();
        const csv = json2csvParser.parse(datasets.map(d => d.data));

        res.header('Content-Type', 'text/csv');
        res.attachment('cleaned_dataset.csv');
        return res.send(csv);
    } catch (error) {
        console.error("Backend: Download error:", error);
        res.status(500).json({ error: "Failed to generate cleaned CSV" });
    }
});

module.exports = router;
