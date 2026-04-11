/**
 * analyticsValidator.js
 * ─────────────────────
 * Input validation for POST /api/analytics.
 * Returns { valid, errors, cleanedData } — never throws.
 * Coerces values rather than rejecting borderline rows so the
 * confidence score reflects real data quality to the caller.
 */

const REQUIRED_FIELDS = ['date', 'product', 'revenue'];

/**
 * Attempt to parse a value as a float.
 * Strips common currency symbols / commas first.
 */
const toFloat = (val) => {
    if (typeof val === 'number' && !isNaN(val)) return val;
    if (typeof val === 'string') {
        const cleaned = val.replace(/[₹$€£,\s]/g, '');
        const n = parseFloat(cleaned);
        return isNaN(n) ? null : n;
    }
    return null;
};

/**
 * Attempt to parse a value as an ISO date string.
 * Accepts any format that Date() can handle and normalises to YYYY-MM-DD.
 */
const toISODate = (val) => {
    if (!val) return null;
    const d = new Date(val);
    if (isNaN(d.getTime())) return null;
    return d.toISOString().slice(0, 10); // YYYY-MM-DD
};

/**
 * Validate and clean the analytics input payload.
 *
 * @param {object} body - req.body
 * @returns {{ valid: boolean, errors: string[], cleanedData: object[], totalRows: number, validRows: number }}
 */
const validateAnalyticsInput = (body) => {
    const errors = [];

    // ── Top-level shape ───────────────────────────────────────────────────────
    if (!body || typeof body !== 'object') {
        return { valid: false, errors: ['Request body must be a JSON object.'], cleanedData: [], totalRows: 0, validRows: 0 };
    }

    if (!Array.isArray(body.data)) {
        return { valid: false, errors: ['`data` must be an array of objects.'], cleanedData: [], totalRows: 0, validRows: 0 };
    }

    if (body.data.length === 0) {
        return { valid: false, errors: ['`data` array is empty.'], cleanedData: [], totalRows: 0, validRows: 0 };
    }

    // ── Row-level validation ──────────────────────────────────────────────────
    const cleanedData = [];
    let invalidRows = 0;
    const rowErrors = [];

    body.data.forEach((row, i) => {
        if (!row || typeof row !== 'object') {
            rowErrors.push(`Row ${i}: not an object.`);
            invalidRows++;
            return;
        }

        // Check required fields exist
        const missing = REQUIRED_FIELDS.filter(f => !(f in row));
        if (missing.length > 0) {
            rowErrors.push(`Row ${i}: missing field(s): ${missing.join(', ')}.`);
            invalidRows++;
            return;
        }

        // Coerce & validate
        const revenue = toFloat(row.revenue);
        const date    = toISODate(row.date);
        const product = String(row.product || '').trim();

        if (revenue === null) {
            rowErrors.push(`Row ${i}: revenue "${row.revenue}" is not a valid number.`);
            invalidRows++;
            return;
        }

        if (!date) {
            rowErrors.push(`Row ${i}: date "${row.date}" could not be parsed.`);
            invalidRows++;
            return;
        }

        if (!product) {
            rowErrors.push(`Row ${i}: product name is empty.`);
            invalidRows++;
            return;
        }

        cleanedData.push({
            ...row,       // preserve any extra columns for callers
            date,
            product,
            revenue
        });
    });

    const totalRows = body.data.length;
    const validRows = cleanedData.length;

    // Surface a sample of row errors (max 5) so the response stays concise
    if (rowErrors.length > 0) {
        errors.push(...rowErrors.slice(0, 5));
        if (rowErrors.length > 5) {
            errors.push(`…and ${rowErrors.length - 5} more row error(s).`);
        }
    }

    // Fail if NO valid rows survived
    if (validRows === 0) {
        return { valid: false, errors: ['No valid rows found after validation.', ...errors], cleanedData: [], totalRows, validRows };
    }

    return { valid: true, errors, cleanedData, totalRows, validRows };
};

module.exports = { validateAnalyticsInput };
