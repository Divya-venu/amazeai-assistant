/**
 * insightsGenerator.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Generates plain-English business insights from computed analytics data.
 * Also detects anomalies (revenue spikes, extreme discounts).
 * Returns an array of insight strings for the frontend AI panel.
 *
 * All operations are O(m + p) where m = months, p = products (≪ n).
 */

/**
 * Format a number as a currency string (INR shorthand).
 * e.g. 1234567 → "₹12.3L" / 1234 → "₹1,234"
 */
const fmt = (n) => {
    if (n >= 10_000_000) return `₹${(n / 10_000_000).toFixed(1)}Cr`;
    if (n >= 100_000)    return `₹${(n / 100_000).toFixed(1)}L`;
    return `₹${Math.round(n).toLocaleString('en-IN')}`;
};

/**
 * @param {object} params
 * @param {number}   params.totalRevenue
 * @param {string}   params.peakMonth
 * @param {number}   params.peakMonthRevenue
 * @param {Array}    params.monthlyRevenue     - [{ month, revenue, growthPct }]
 * @param {Array}    params.topProducts        - [{ product, revenue, share }]
 * @param {number}   params.avgDiscount        - average discount_percentage (optional)
 * @param {number}   params.avgEngagement      - average engagement score (optional)
 * @param {number}   params.validRows
 * @param {number}   params.totalRows
 * @param {string}   params.schemaType
 * @param {string}   params.revenueFormula
 * @returns {string[]} Array of human-readable insight strings
 */
const generateInsights = ({
    totalRevenue,
    peakMonth,
    peakMonthRevenue,
    monthlyRevenue = [],
    topProducts    = [],
    avgDiscount,
    avgEngagement,
    validRows,
    totalRows,
    schemaType,
    revenueFormula
}) => {
    const insights = [];

    // ── Schema transparency ───────────────────────────────────────────────────
    insights.push(`Schema detected: ${schemaType} — revenue computed as (${revenueFormula}).`);

    // ── Total revenue ─────────────────────────────────────────────────────────
    insights.push(`Total estimated revenue: ${fmt(totalRevenue)} across ${validRows.toLocaleString()} records.`);

    // ── Peak month ────────────────────────────────────────────────────────────
    if (peakMonth) {
        insights.push(`Best month: ${peakMonth} with ${fmt(peakMonthRevenue)} in revenue.`);
    }

    // ── Month-over-month growth ───────────────────────────────────────────────
    const growthMonths = monthlyRevenue.filter(m => m.growthPct !== null);
    if (growthMonths.length > 0) {
        const bestGrowth  = growthMonths.reduce((a, b) => b.growthPct > a.growthPct ? b : a);
        const worstGrowth = growthMonths.reduce((a, b) => b.growthPct < a.growthPct ? b : a);
        const lastMonth   = monthlyRevenue[monthlyRevenue.length - 1];

        if (lastMonth?.growthPct !== null) {
            const dir  = lastMonth.growthPct >= 0 ? 'up' : 'down';
            const sign = lastMonth.growthPct >= 0 ? '+' : '';
            insights.push(`Most recent month (${lastMonth.month}) revenue is ${dir} ${sign}${lastMonth.growthPct}% vs prior month.`);
        }

        if (bestGrowth.growthPct > 0) {
            insights.push(`Strongest growth: ${bestGrowth.month} (+${bestGrowth.growthPct}% MoM).`);
        }
        if (worstGrowth.growthPct < 0) {
            insights.push(`Sharpest decline: ${worstGrowth.month} (${worstGrowth.growthPct}% MoM) — investigate causes.`);
        }
    }

    // ── Top product dominance ─────────────────────────────────────────────────
    if (topProducts.length > 0) {
        const top = topProducts[0];
        insights.push(`#1 product: "${top.product}" accounts for ${top.share}% of total revenue (${fmt(top.revenue)}).`);

        if (topProducts.length >= 2) {
            const top2Share = topProducts.slice(0, 2).reduce((s, p) => s + p.share, 0);
            if (top2Share > 60) {
                insights.push(`Top 2 products control ${top2Share.toFixed(1)}% of revenue — high concentration risk.`);
            }
        }

        if (topProducts.length >= 5) {
            const longTailShare = 100 - topProducts.slice(0, 5).reduce((s, p) => s + p.share, 0);
            if (longTailShare > 30) {
                insights.push(`Long-tail products contribute ${longTailShare.toFixed(1)}% of revenue — diversification is healthy.`);
            }
        }
    }

    // ── Discount anomaly detection ────────────────────────────────────────────
    if (avgDiscount !== null && avgDiscount !== undefined) {
        if (avgDiscount > 50) {
            insights.push(`⚠ Anomaly: Average discount is ${avgDiscount.toFixed(1)}% — margins may be critically compressed.`);
        } else if (avgDiscount > 30) {
            insights.push(`High average discount detected: ${avgDiscount.toFixed(1)}%. Monitor margin impact.`);
        } else {
            insights.push(`Average discount: ${avgDiscount.toFixed(1)}% — within healthy range.`);
        }
    }

    // ── Customer engagement ───────────────────────────────────────────────────
    if (avgEngagement !== null && avgEngagement !== undefined) {
        insights.push(`Average customer engagement score (rating × rating_count): ${Math.round(avgEngagement).toLocaleString()}.`);
        if (avgEngagement > 10000) {
            insights.push(`High engagement indicates strong product-market fit.`);
        }
    }

    // ── Revenue spike anomaly (stddev-based) ──────────────────────────────────
    if (monthlyRevenue.length >= 3) {
        const revenues = monthlyRevenue.map(m => m.revenue);
        const mean     = revenues.reduce((a, b) => a + b, 0) / revenues.length;
        const stddev   = Math.sqrt(revenues.reduce((a, b) => a + (b - mean) ** 2, 0) / revenues.length);
        const spikes   = monthlyRevenue.filter(m => m.revenue > mean + 2 * stddev);

        if (spikes.length > 0) {
            insights.push(`⚠ Revenue spike detected in: ${spikes.map(s => s.month).join(', ')} (>2σ above average — verify data integrity).`);
        }
    }

    // ── Data quality ──────────────────────────────────────────────────────────
    const quality = parseFloat(((validRows / totalRows) * 100).toFixed(1));
    if (quality < 90) {
        insights.push(`⚠ Data quality: only ${quality}% of rows were valid — ${totalRows - validRows} rows skipped.`);
    } else {
        insights.push(`Data quality: ${quality}% — ${totalRows - validRows} rows skipped.`);
    }

    return insights;
};

module.exports = { generateInsights };
