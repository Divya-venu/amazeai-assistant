const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csv-parser');
const stream = require('stream');
const { processCsvData } = require('../agents/analyzeAgent');

// Configure Multer for in-memory file uploads
const upload = multer({ storage: multer.memoryStorage() });

// @route POST /api/analyze
// @desc Upload a CSV file, parse it, and return AI insights
router.post('/', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded. Please upload a CSV file.' });
        }

        const results = [];
        
        // Convert the buffer to a readable stream and pipe it through csv-parser
        const bufferStream = new stream.PassThrough();
        bufferStream.end(req.file.buffer);

        bufferStream
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', async () => {
                try {
                    // Pass the parsed JSON to the OpenClaw Analyze Agent
                    const aiInsights = await processCsvData(results);
                    
                    res.status(200).json({
                        insights: aiInsights
                    });
                } catch (aiError) {
                    console.error("AI Error during CSV analysis:", aiError);
                    res.status(500).json({ error: 'Failed to generate AI insights from the data.' });
                }
            })
            .on('error', (err) => {
                console.error("CSV Parsing Error:", err);
                res.status(500).json({ error: 'Failed to parse the uploaded CSV file.' });
            });

    } catch (error) {
        console.error("Analyze Route Error:", error.message);
        res.status(500).json({ error: 'Internal Server Error during file upload.' });
    }
});

module.exports = router;
