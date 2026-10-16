const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const Dataset = require('../models/Dataset');
const Sale = require('../models/Sale');
const AIResult = require('../models/AIResult');
const { processCSV } = require('../utils/csvProcessor');

/**
 * Safely removes a file from disk without throwing.
 * Always call in a finally block after processing an upload.
 */
const cleanupTempFile = (filePath) => {
    if (!filePath) return;
    fs.unlink(filePath, (err) => {
        if (err && err.code !== 'ENOENT') {
            console.warn(`[uploadController] Failed to delete temp file: ${filePath}`, err.message);
        }
    });
};

/**
 * POST /api/upload
 * Accepts a CSV via multipart/form-data, parses it, persists to DB, and
 * returns the parsed data as JSON. Temp file is always cleaned up.
 */
const handleUpload = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            error: 'No file provided.',
            details: 'Attach a CSV file using the "file" field in FormData.'
        });
    }

    const tempPath = req.file.path;

    try {
        console.log(`[uploadController] Processing: ${req.file.originalname} (${req.file.size} bytes)`);

        // ── 1. Parse CSV ──────────────────────────────────────────────────────
        const { data, preview, meta, schemaMeta } = await processCSV(tempPath);
        console.log('[DEBUG] First processed CSV row:', data[0]);
console.log('[DEBUG] CSV row keys:', Object.keys(data[0] || {}));

        if (!data || data.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No records found in the CSV.',
                details: 'The file may be empty, malformed, or contain only headers.'
            });
        }

          // ── 2. Persist to MongoDB ─────────────────────────────────────────────
        const datasetId = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString();

        // Clear old dataset
        await Dataset.deleteMany({});

        // Save the original uploaded data
        const rows = data.map(row => ({
            datasetId,
            schemaMeta,
            data: row
        }));

            await Dataset.insertMany(rows);

            // Convert CSV rows into Sale documents
            const salesRecords = data.map(row => ({
                productName: row.product,
                category: row.category,
                price: Number(row.price),
                costPrice: Number(row.costPrice),
                quantity: Number(row.quantity),
                date: new Date(row.date),
                customerName: 'Guest',
                paymentMethod: 'Cash',
                country: 'Unknown'
            }));

            // Replace old sales with the newly uploaded dataset
            await Sale.deleteMany({});

            // Insert new sales records
            await Sale.insertMany(salesRecords);

            console.log(`[uploadController] Inserted ${salesRecords.length} sales records.`);

        // ── 3. Real-time notification via Socket.IO ───────────────────────────
        const io = req.app.get('io');
        if (io) {
            io.emit('datasetUpdated', {
                message: 'Dataset ingested successfully',
                meta,
                schemaMeta
            });
        }

        // ── 4. Respond ────────────────────────────────────────────────────────
        return res.status(200).json({
            success: true,
            message: 'CSV uploaded and parsed successfully.',
            count: rows.length,
            preview,           // First 10 rows
            data,              // Full parsed JSON array
            meta,              // Delimiter, confidence, etc.
            schemaMeta         // AI-inferred schema (metrics / dimensions / timeColumn)
        });

    } catch (err) {
        console.error('[uploadController] Error:', err);
        return res.status(500).json({
            success: false,
            error: 'CSV processing failed.',
            details: err.message,
            suggestion: 'Ensure the file is UTF-8 encoded and contains comma-separated values.'
        });

    } finally {
        // Always remove the temp file regardless of success or failure
        cleanupTempFile(tempPath);
    }
};

module.exports = { handleUpload };
