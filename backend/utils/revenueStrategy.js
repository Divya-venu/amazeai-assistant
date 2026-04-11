/**
 * revenueStrategy.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Detects the CSV schema on the FIRST ROW and returns:
 *   - computeRevenue(row)   → number   — how to derive revenue for any row
 *   - getProduct(row)       → string   — which field is the product dimension
 *   - getDate(row)          → string   — which field is the time dimension
 *   - schemaType            → string   — human-readable schema name
 *   - revenueFormula        → string   — description of the formula used
 *
 * Supported schemas (checked in priority order):
 *   1. ECOMMERCE     — discounted_price × rating_count
 *   2. DIRECT        — revenue field present
 *   3. PRICE_QTY     — price × quantity (or unit_price × qty / units_sold)
 *   4. SALES_AMOUNT  — any *sales* or *amount* or *total* column
 *   5. FALLBACK      — first numeric column × 1 (best effort)
 */

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Strip symbols and parse to float; returns null on failure */
const toFloat = (val) => {
    if (typeof val === 'number') return isNaN(val) ? null : val;
    if (typeof val === 'string') {
        const n = parseFloat(val.replace(/[₹$€£,\s%]/g, ''));
        return isNaN(n) ? null : n;
    }
    return null;
};

/** Find the first header that matches any of the given regex patterns (case-insensitive) */
const findHeader = (headers, ...patterns) =>
    headers.find(h => patterns.some(p => p.test(h.toLowerCase())));

// ── Strategy detector ─────────────────────────────────────────────────────────

/**
 * Inspect the first CSV row's headers and return a strategy object.
 *
 * @param {string[]} headers - Array of CSV column names (trimmed, original case)
 * @returns {{ schemaType, revenueFormula, computeRevenue, getProduct, getDate }}
 */
const detectStrategy = (headers) => {
    const lower = headers.map(h => h.toLowerCase());

    // ── Shared dimension finders ──────────────────────────────────────────────
    const productField = findHeader(headers,
        /^product/, /product.name/, /item/, /sku/, /title/, /name/, /brand/, /category/
    ) || headers.find((_, i) => /categor|product|item|brand/i.test(lower[i]));

    const dateField = findHeader(headers,
        /^date/, /order.date/, /purchase.date/, /transaction.date/, /sale.date/,
        /created.at/, /timestamp/, /month/, /year/
    );

    const safeProduct = (row) => String(row[productField] ?? row[headers[0]] ?? 'Unknown').trim().slice(0, 120);
    const safeDate    = (row) => {
        if (!dateField) return null;
        const v = row[dateField];
        if (!v || String(v).trim() === '') return null;
        const d = new Date(v);
        return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
    };

    // ── 1. E-commerce schema ─ discounted_price × rating_count ───────────────
    const priceField  = findHeader(headers, /discounted.price/, /sale.price/, /selling.price/);
    const countField  = findHeader(headers, /rating.count/, /review.count/, /no.of.ratings/, /ratings/);

    if (priceField && countField) {
        return {
            schemaType:     'ECOMMERCE',
            revenueFormula: `${priceField} × ${countField}`,
            computeRevenue: (row) => {
                const price = toFloat(row[priceField]);
                const count = toFloat(row[countField]);
                return (price !== null && count !== null) ? price * count : null;
            },
            getProduct: safeProduct,
            getDate:    safeDate,
            extras: (row) => ({
                actualPrice:        toFloat(row[findHeader(headers, /actual.price/, /original.price/, /mrp/)]),
                discountPercentage: toFloat(row[findHeader(headers, /discount.percent/, /discount_pct/)]),
                rating:             toFloat(row[findHeader(headers, /^rating$/)]),
                engagementScore:    (() => {
                    const r = toFloat(row[findHeader(headers, /^rating$/)]);
                    const c = toFloat(row[countField]);
                    return (r !== null && c !== null) ? parseFloat((r * c).toFixed(2)) : null;
                })()
            })
        };
    }

    // ── 2. Direct revenue field ───────────────────────────────────────────────
    const revenueField = findHeader(headers, /^revenue$/, /^revenue./, /total.revenue/, /gross.revenue/);
    if (revenueField) {
        return {
            schemaType:     'DIRECT',
            revenueFormula: revenueField,
            computeRevenue: (row) => toFloat(row[revenueField]),
            getProduct:     safeProduct,
            getDate:        safeDate,
            extras:         () => ({})
        };
    }

    // ── 3. Price × Quantity schema ────────────────────────────────────────────
    const unitPriceField = findHeader(headers, /price/, /rate/, /unit.cost/);
    const qtyField       = findHeader(headers, /quantity/, /qty/, /units.sold/, /sales.qty/, /volume/);

    if (unitPriceField && qtyField) {
        return {
            schemaType:     'PRICE_QTY',
            revenueFormula: `${unitPriceField} × ${qtyField}`,
            computeRevenue: (row) => {
                const price = toFloat(row[unitPriceField]);
                const qty   = toFloat(row[qtyField]);
                return (price !== null && qty !== null) ? price * qty : null;
            },
            getProduct: safeProduct,
            getDate:    safeDate,
            extras:     () => ({})
        };
    }

    // ── 4. Sales / Amount / Total column ─────────────────────────────────────
    const salesField = findHeader(headers,
        /sale/, /amount/, /total/, /income/, /earning/, /turnover/, /gmv/
    );
    if (salesField) {
        return {
            schemaType:     'SALES_AMOUNT',
            revenueFormula: salesField,
            computeRevenue: (row) => toFloat(row[salesField]),
            getProduct:     safeProduct,
            getDate:        safeDate,
            extras:         () => ({})
        };
    }

    // ── 5. Fallback — first numeric-looking column ────────────────────────────
    const firstNumericField = headers.find(h => {
        const lower = h.toLowerCase();
        return /\d/.test(lower) || /cost|value|count|num|score/.test(lower);
    }) || headers[1] || headers[0];

    return {
        schemaType:     'FALLBACK',
        revenueFormula: `${firstNumericField} (estimated)`,
        computeRevenue: (row) => toFloat(row[firstNumericField]),
        getProduct:     safeProduct,
        getDate:        safeDate,
        extras:         () => ({})
    };
};

module.exports = { detectStrategy, toFloat };
