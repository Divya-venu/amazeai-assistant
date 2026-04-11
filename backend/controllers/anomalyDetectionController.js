const { spawn } = require('child_process');
const path = require('path');
const logger = require('../utils/logger');

/**
 * Run Python Anomaly Detection Model
 * @param {Array} dataset 
 * @returns {Promise<Object>}
 */
const runPythonAnomalyModel = (dataset) => {
    return new Promise((resolve, reject) => {
        const pythonProcess = spawn('python', [
            path.join(__dirname, '../python/anomaly_detection.py')
        ]);

        let result = '';
        let errorResult = '';

        pythonProcess.stdin.write(JSON.stringify(dataset));
        pythonProcess.stdin.end();

        pythonProcess.stdout.on('data', (data) => {
            result += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            errorResult += data.toString();
            logger.error(`[Python stderr]: ${data}`);
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                return reject(new Error(errorResult || `Python process exited with code ${code}`));
            }
            try {
                const parsedResult = JSON.parse(result);
                if (parsedResult.error) {
                    return reject(new Error(parsedResult.error));
                }
                resolve(parsedResult);
            } catch (e) {
                reject(new Error(`Failed to parse Python output: ${e.message}`));
            }
        });
    });
};

/**
 * @route   POST /api/anomaly-detection
 * @desc    Detect anomalies in uploaded dataset
 * @access  Public (or Protected if needed)
 */
exports.detectAnomalies = async (req, res) => {
    try {
        const { dataset } = req.body;
        
        if (!dataset || !Array.isArray(dataset)) {
            return res.status(400).json({ error: "Missing or invalid dataset provided." });
        }

        const anomalies = await runPythonAnomalyModel(dataset);
        res.json(anomalies);
    } catch (error) {
        logger.error(`[Anomaly Detection Controller Error]: ${error.message}`);
        res.status(500).json({ error: "Failed to detect anomalies", details: error.message });
    }
};
