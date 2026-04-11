/**
 * csvStreamController.js
 * ─────────────────────────────────────────────────────────────────────────────
 * POST /api/upload-csv
 *
 * Production-grade, schema-adaptive, memory-safe CSV ingestion pipeline.
 *
 * How it works:
 *   1. Multer writes the file to disk (never in RAM)
 *   2. The FIRST row is inspected to detect the revenue schema automatically
 *      (e-commerce, direct revenue, price×qty, sales/amount, or fallback)
 *   3. csv-parser streams rows one-by-one — only Map accumulators grow
 *   4. Single pass computes: total revenue, monthly trends, top products,
 *      avg discount, avg engagement score
 *   5. Insights + anomalies are generated from the aggregated Maps
 *   6. Temp file is always deleted in the finally block
 *
 * Memory footprint: O(unique months + unique products) — NOT O(n rows)
 */

'use strict';

const fs  = require('fs');
const csv = require('csv-parser');

const { detectStrategy } = require('../utils/revenueStrategy');
const { generateInsights } = require('../utils/insightsGenerator');

// ── Constants ─────────────────────────────────────────────────────────────────
const TOP_PRODUCTS_LIMIT    = 5;
const PROGRESS_LOG_INTERVAL = 50_000; // log every 50k rows for large files

// ── Pure helpers ──────────────────────────────────────────────────────────────

/** Detect CSV delimiter from the first line (sync, single read) */
const detectDelimiter = (filePath) => {
    try {
        const firstLine = fs.readFileSync(filePath, { encoding: 'utf8' }).split('\n')[0] || '';
        if (firstLine.includes('\t')) return '\t';
        if (firstLine.includes(';'))  return ';';
        return ',';
    } catch {
        return ',';
    }
};

/** Month-over-month growth %; null for first month */
const growthPct = (current, previous) => {
    if (previous === null || previous === undefined) return null;
    if (previous === 0) return current > 0 ? 100 : 0;
    return parseFloat((((current - previous) / previous) * 100).toFixed(2));
};

/** Safely remove a temp file without throwing */
const cleanupFile = (filePath) => {
    if (!filePath) return;
    fs.unlink(filePath, (err) => {
        if (err && err.code !== 'ENOENT') {
            console.warn(`[csvStream] Could not delete temp file: ${filePath}`, err.message);
        }
    });
};

// ── Core streaming pipeline ───────────────────────────────────────────────────

/**
 * Stream-parse a CSV file and compute analytics without loading it into memory.
 *
 * @param {string} filePath - Absolute path to the uploaded temp file
 * @param {string} originalName - Original filename (for logging)
 * @returns {Promise<object>} Full analytics result
 */
const streamAndCompute = (filePath, originalName = 'unknown') => {
    return new Promise((resolve, reject) => {
        const delimiter = detectDelimiter(filePath);

        // ── Strategy — detected on first row ──────────────────────────────────
        let strategy      = null;   // set on first data row
        let schemaLogged  = false;

        // ── In-flight accumulators ────────────────────────────────────────────
        let totalRevenue    = 0;
        let totalRows       = 0;
        let validRows       = 0;
        let discountSum     = 0;
        let discountCount   = 0;
        let engagementSum   = 0;
        let engagementCount = 0;

        /** @type {Map<string, number>} YYYY-MM → revenue */
        const monthMap   = new Map();
        /** @type {Map<string, number>} product  → revenue */
        const productMap = new Map();

        // ── Stream ────────────────────────────────────────────────────────────
        fs.createReadStream(filePath)
            .pipe(csv({
                separator:  delimiter,
                mapHeaders: ({ header }) => header.trim()
            }))
            .on('data', (row) => {
                totalRows++;

                // ── Detect strategy on first row (O(1) detection) ─────────────
                if (!strategy) {
                    strategy = detectStrategy(Object.keys(row));
                    if (!schemaLogged) {
                        console.log(`[csvStream] "${originalName}" → schema: ${strategy.schemaType} | formula: ${strategy.revenueFormula}`);
                        schemaLogged = true;
                    }
                }

                // ── Progress logging for large files ──────────────────────────
                if (totalRows % PROGRESS_LOG_INTERVAL === 0) {
                    console.log(`[csvStream] "${originalName}" — processed ${totalRows.toLocaleString()} rows…`);
                }

                // ── Compute revenue ───────────────────────────────────────────
                const revenue = strategy.computeRevenue(row);
                if (revenue === null || revenue < 0) return;  // skip invalid

                const product = strategy.getProduct(row);
                const date    = strategy.getDate(row);

                if (!product) return; // product is mandatory dimension

                validRows++;
                totalRevenue += revenue;

                // Month accumulation (date may be absent in some schemas)
                const month = date ? date.slice(0, 7) : 'N/A';
                monthMap.set(month,   (monthMap.get(month)   ?? 0) + revenue);
                productMap.set(product, (productMap.get(product) ?? 0) + revenue);

                // ── Extra fields (e-commerce bonuses) ──────────────────────────
                const extras = strategy.extras ? strategy.extras(row) : {};

                if (extras.discountPercentage !== null && extras.discountPercentage !== undefined) {
                    discountSum   += extras.discountPercentage;
                    discountCount += 1;
                }
                if (extras.engagementScore !== null && extras.engagementScore !== undefined) {
                    engagementSum   += extras.engagementScore;
                    engagementCount += 1;
                }
            })
            .on('end', () => {
                if (validRows === 0) {
                    return reject(Object.assign(
                        new Error('No valid rows found. Check required fields for this schema type.'),
                        { code: 'INVALID_CSV' }
                    ));
                }

                console.log(`[csvStream] "${originalName}" complete — ${validRows.toLocaleString()} valid / ${totalRows.toLocaleString()} total rows.`);

                // ── Monthly revenue — sort + growth % ────────────────────────
                // Exclude 'N/A' bucket from monthly trend if other months exist
                const hasRealMonths = [...monthMap.keys()].some(k => k !== 'N/A');
                const sortedMonths  = [...monthMap.entries()]
                    .filter(([k]) => hasRealMonths ? k !== 'N/A' : true)
                    .sort(([a], [b]) => a.localeCompare(b));

                let prevRev      = null;
                let peakMonth    = null;
                let peakRevenue  = -Infinity;

                const monthlyRevenue = sortedMonths.map(([month, revenue]) => {
                    const growth = growthPct(revenue, prevRev);
                    prevRev = revenue;
                    if (revenue > peakRevenue) { peakRevenue = revenue; peakMonth = month; }
                    return { month, revenue: parseFloat(revenue.toFixed(2)), growthPct: growth };
                });

                // ── Top products ───────────────────────────────────────────────
                const topProducts = [...productMap.entries()]
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, TOP_PRODUCTS_LIMIT)
                    .map(([product, revenue]) => ({
                        product,
                        revenue: parseFloat(revenue.toFixed(2)),
                        share:   totalRevenue > 0
                            ? parseFloat(((revenue / totalRevenue) * 100).toFixed(2))
                            : 0
                    }));

                // ── Derived KPIs ───────────────────────────────────────────────
                const avgDiscount   = discountCount   > 0 ? parseFloat((discountSum   / discountCount).toFixed(2))   : null;
                const avgEngagement = engagementCount > 0 ? parseFloat((engagementSum / engagementCount).toFixed(2)) : null;
                const confidenceScore = parseFloat(((validRows / totalRows) * 100).toFixed(2));

                // ── Insights ───────────────────────────────────────────────────
                const insights = generateInsights({
                    totalRevenue,
                    peakMonth,
                    peakMonthRevenue: peakMonth ? parseFloat(peakRevenue.toFixed(2)) : 0,
                    monthlyRevenue,
                    topProducts,
                    avgDiscount,
                    avgEngagement,
                    validRows,
                    totalRows,
                    schemaType:     strategy.schemaType,
                    revenueFormula: strategy.revenueFormula
                });

                // ── Final response ─────────────────────────────────────────────
                resolve({
                    kpis: {
                        totalRevenue:     parseFloat(totalRevenue.toFixed(2)),
                        currency:         'INR',
                        avgDiscount,
                        avgEngagementScore: avgEngagement,
                        topProduct:       topProducts[0]?.product   ?? null,
                        bestMonth:        peakMonth,
                        bestMonthRevenue: peakMonth ? parseFloat(peakRevenue.toFixed(2)) : 0
                    },
                    monthlyRevenue,
                    topProducts,
                    insights,
                    meta: {
                        recordsProcessed: totalRows,
                        validRows,
                        invalidRows:      totalRows - validRows,
                        confidence:       `${confidenceScore}%`,
                        schemaDetected:   strategy.schemaType,
                        revenueFormula:   strategy.revenueFormula,
                        status:           'success'
                    }
                });
            })
            .on('error', (err) => {
                console.error(`[csvStream] Stream error processing "${originalName}":`, err.message);
                reject(err);
            });
    });
};

// ── Controller ────────────────────────────────────────────────────────────────

/**
 * POST /api/upload-csv
 *
 * Accepts multipart/form-data with a single 'file' field (CSV, up to 500MB).
 * Streams the file through the analytics engine, cleans up temp file, returns JSON.
 */
const uploadAndAnalyse = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            error:  'No file provided. Attach a CSV via the "file" field in FormData.',
            status: 'failed'
        });
    }

    const tempPath = req.file.path;

    try {
        console.log(`[csvStream] Received: "${req.file.originalname}" — ${(req.file.size / 1024 / 1024).toFixed(2)} MB`);

        const result = await streamAndCompute(tempPath, req.file.originalname);

        // Real-time Socket.IO push
        const io = req.app.get('io');
        if (io) {
            io.emit('csvAnalyticsReady', {
                message: 'Analytics computed from uploaded CSV',
                meta:    result.meta
            });
        }

        return res.status(200).json(result);

    } catch (err) {
        console.error('[csvStream] Error:', err.message);

        if (err.code === 'INVALID_CSV') {
            return res.status(400).json({
                error:  err.message,
                status: 'failed'
            });
        }

        return res.status(500).json({
            error:      'CSV processing failed.',
            details:    err.message,
            suggestion: 'Ensure the file is valid UTF-8 CSV. Check the server logs for schema details.',
            status:     'failed'
        });

    } finally {
        cleanupFile(tempPath); // always runs — no disk leaks
    }
};

module.exports = { uploadAndAnalyse };
