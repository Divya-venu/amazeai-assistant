/**
 * analyticsService.js
 * ────────────────────
 * Single-pass O(n) analytics computation engine.
 *
 * Given a cleaned array of { date, product, revenue, ...extras } rows it
 * computes — in ONE iteration over the data:
 *   • Total revenue
 *   • Monthly revenue (YYYY-MM), sorted chronologically
 *   • Month-over-month growth %
 *   • Peak month
 *   • Top 5 products by revenue
 *   • Per-product revenue share (%)
 *   • Data confidence score
 *
 * Results are cached in memory (keyed by SHA-256 of the serialised input)
 * for 5 minutes to avoid redundant recomputation for identical payloads.
 */

const crypto = require('crypto');

// ── In-memory result cache ────────────────────────────────────────────────────
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const resultCache  = new Map();      // key: sha256 hex → { result, expiresAt }

const getCacheKey  = (rows) => crypto.createHash('sha256').update(JSON.stringify(rows)).digest('hex');

const getFromCache = (key) => {
    const entry = resultCache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
        resultCache.delete(key);
        return null;
    }
    return entry.result;
};

const setInCache = (key, result) => {
    resultCache.set(key, { result, expiresAt: Date.now() + CACHE_TTL_MS });
};

// ── Pure helpers ──────────────────────────────────────────────────────────────

/** Extract YYYY-MM from an ISO date string */
const toYearMonth = (isoDate) => isoDate.slice(0, 7);

/**
 * Compute month-over-month growth percentage.
 * Returns null for the first month (no prior baseline).
 */
const growthPct = (current, previous) => {
    if (previous === null || previous === undefined) return null;
    if (previous === 0) return current > 0 ? 100 : 0;
    return parseFloat((((current - previous) / previous) * 100).toFixed(2));
};

// ── Core engine ───────────────────────────────────────────────────────────────

/**
 * @param {Array<{ date: string, product: string, revenue: number }>} rows
 * @param {{ totalRows: number, validRows: number }} meta
 * @returns {object} Structured analytics result
 */
const computeAnalytics = (rows, { totalRows, validRows } = {}) => {
    // ── Cache lookup ──────────────────────────────────────────────────────────
    const cacheKey = getCacheKey(rows);
    const cached   = getFromCache(cacheKey);
    if (cached) return { ...cached, meta: { ...cached.meta, cached: true } };

    // ── Single-pass accumulators ──────────────────────────────────────────────
    let totalRevenue = 0;

    /** @type {Map<string, number>} month (YYYY-MM) → revenue */
    const monthMap = new Map();

    /** @type {Map<string, number>} product → revenue */
    const productMap = new Map();

    for (const row of rows) {
        const rev     = row.revenue;      // already a float after validation
        const month   = toYearMonth(row.date);
        const product = row.product;

        // KPI total
        totalRevenue += rev;

        // Monthly aggregation
        monthMap.set(month, (monthMap.get(month) ?? 0) + rev);

        // Product aggregation
        productMap.set(product, (productMap.get(product) ?? 0) + rev);
    }

    // ── Monthly revenue — sort + growth % ────────────────────────────────────
    const sortedMonths = [...monthMap.entries()].sort(([a], [b]) => a.localeCompare(b));

    let peakMonth        = null;
    let peakMonthRevenue = 0;
    let prevRevenue      = null;

    const monthlyRevenue = sortedMonths.map(([month, revenue]) => {
        const growth = growthPct(revenue, prevRevenue);
        prevRevenue  = revenue;

        if (revenue > peakMonthRevenue) {
            peakMonthRevenue = revenue;
            peakMonth        = month;
        }

        return { month, revenue: parseFloat(revenue.toFixed(2)), growthPct: growth };
    });

    // ── Top 5 products — sort desc + share % ─────────────────────────────────
    const sortedProducts = [...productMap.entries()].sort(([, a], [, b]) => b - a);

    const topProducts = sortedProducts.slice(0, 5).map(([product, revenue]) => ({
        product,
        revenue:  parseFloat(revenue.toFixed(2)),
        share: totalRevenue > 0
            ? parseFloat(((revenue / totalRevenue) * 100).toFixed(2))
            : 0
    }));

    // ── Confidence score ──────────────────────────────────────────────────────
    const effectiveTotalRows = totalRows ?? rows.length;
    const effectiveValidRows = validRows ?? rows.length;
    const confidenceScore    = effectiveTotalRows > 0
        ? parseFloat(((effectiveValidRows / effectiveTotalRows) * 100).toFixed(2))
        : 100;

    // ── Assemble result ───────────────────────────────────────────────────────
    const result = {
        kpis: {
            totalRevenue:    parseFloat(totalRevenue.toFixed(2)),
            currency:        'INR',
            peakMonth,
            peakMonthRevenue: parseFloat(peakMonthRevenue.toFixed(2))
        },
        monthlyRevenue,
        topProducts,
        meta: {
            recordsProcessed: effectiveTotalRows,
            validRows:        effectiveValidRows,
            invalidRows:      effectiveTotalRows - effectiveValidRows,
            confidenceScore,
            status:  'success',
            cached:  false
        }
    };

    // ── Cache & return ────────────────────────────────────────────────────────
    setInCache(cacheKey, result);
    return result;
};

module.exports = { computeAnalytics };
