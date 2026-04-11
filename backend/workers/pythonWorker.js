const { spawn } = require('child_process');
const path = require('path');
const logger = require('../utils/logger');

/**
 * Centralized utility to run Python ML models
 * @param {string} scriptName - Name of the script in backend/python/
 * @param {any} data - Data to send to stdin as JSON
 * @returns {Promise<any>} - Parsed JSON output from the script
 */
const runPythonScript = (scriptName, data) => {
    return new Promise((resolve, reject) => {
        const scriptPath = path.join(__dirname, '../python', scriptName);
        console.log(`[PythonWorker] Spawning ${scriptName}...`);

        const pythonProcess = spawn('python', [scriptPath]);

        let stdoutData = '';
        let stderrData = '';

        // Write data to stdin
        if (data) {
            pythonProcess.stdin.write(JSON.stringify(data));
        }
        pythonProcess.stdin.end();

        // Capture output
        pythonProcess.stdout.on('data', (chunk) => {
            stdoutData += chunk.toString();
        });

        // Capture errors
        pythonProcess.stderr.on('data', (chunk) => {
            const err = chunk.toString();
            stderrData += err;
            logger.error(`[PythonWorker ${scriptName} stderr]: ${err}`);
        });

        // Handle process completion
        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                return reject(new Error(`Python process ${scriptName} exited with code ${code}. Error: ${stderrData}`));
            }

            try {
                if (!stdoutData.trim()) {
                    return reject(new Error(`Python process ${scriptName} returned empty output`));
                }
                const parsed = JSON.parse(stdoutData);
                if (parsed.error) {
                    return reject(new Error(parsed.error));
                }
                resolve(parsed);
            } catch (e) {
                logger.error(`[PythonWorker ${scriptName}] Failed to parse JSON: ${stdoutData.substring(0, 500)}`);
                reject(new Error(`Failed to parse output from ${scriptName}: ${e.message}`));
            }
        });

        // Timeout guard: Kill process if it takes more than 30 seconds
        const timeout = setTimeout(() => {
            pythonProcess.kill();
            reject(new Error(`Python process ${scriptName} timed out after 30s`));
        }, 30000);

        pythonProcess.on('exit', () => clearTimeout(timeout));
    });
};

module.exports = { runPythonScript };
