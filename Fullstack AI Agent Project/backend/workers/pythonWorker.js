const { spawn } = require('child_process');
const path = require('path');

/**
 * Utility to run Python scripts in the ML layer
 */
const runPythonScript = (scriptName, data) => {
    return new Promise((resolve, reject) => {
        const scriptPath = path.join(__dirname, '../ml', scriptName);
        const pythonProcess = spawn('python', [scriptPath]);

        let stdoutData = '';
        let stderrData = '';

        if (data) {
            pythonProcess.stdin.write(JSON.stringify(data));
        }
        pythonProcess.stdin.end();

        pythonProcess.stdout.on('data', (chunk) => stdoutData += chunk.toString());
        pythonProcess.stderr.on('data', (chunk) => stderrData += chunk.toString());

        pythonProcess.on('close', (code) => {
            if (code !== 0) return reject(new Error(`Exit code ${code}: ${stderrData}`));

            try {
                resolve(JSON.parse(stdoutData));
            } catch (e) {
                reject(new Error(`Failed to parse Python output: ${e.message}`));
            }
        });

        // 30s Timeout
        setTimeout(() => {
            pythonProcess.kill();
            reject(new Error('Python script timed out after 30s'));
        }, 30000);
    });
};

module.exports = { runPythonScript };
