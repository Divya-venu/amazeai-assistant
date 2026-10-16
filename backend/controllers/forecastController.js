const { spawn } = require('child_process');
const path = require('path');
const Sale = require('../models/Sale');

/**
 * Normalize a dataset row into { month_index, revenue } shape.
 * Supports a wide range of column names from uploaded CSVs.
 */
function normalizeRow(item, index) {
    const revenue = parseFloat(
        item.revenue ??
        item.Revenue ??
        item.totalRevenue ??
        item.total_revenue ??
        item.sales ??
        item.Sales ??
        item.monthly_sales ??
        item.monthlySales ??
        item.amount ??
        item.Amount ??
        0
    );
    return {
        month_index: index + 1,
        revenue: isNaN(revenue) ? 0 : revenue,
    };
}

/**
 * Try to spawn Python using multiple common command names (Windows compatibility).
 * Returns the child process on the first successful spawn attempt.
 */
function spawnPython(scriptPath) {
    const commands = ['python', 'python3', 'py'];
    for (const cmd of commands) {
        try {
            const proc = spawn(cmd, [scriptPath]);
            return proc;
        } catch (e) {
            // try next command
        }
    }
    throw new Error('Python interpreter not found. Please install Python 3.');
}

exports.postForecast = async (req, res) => {
    try {
        console.log('Forecast API called');
        const { dataset } = req.body;

        if (!dataset) {
            return res.status(400).json({ error: 'Dataset missing' });
        }

        if (!Array.isArray(dataset) || dataset.length < 2) {
            return res.status(400).json({
                error: 'Insufficient data for prediction. Need at least 2 data points.',
            });
        }

        // Normalize all rows to { month_index, revenue }
        const forecastInput = dataset
            .map((item, index) => normalizeRow(item, index))
            .filter(row => row.revenue > 0);  // drop zero-revenue rows

        if (forecastInput.length < 2) {
            return res.status(400).json({
                error:
                    'Dataset has fewer than 2 rows with valid revenue values. '
                    + 'Accepted column names: revenue, sales, total_revenue, monthly_sales, amount.',
            });
        }

        const pythonScript = path.join(__dirname, '../python/forecast.py');

        let pythonProcess;
        try {
            pythonProcess = spawnPython(pythonScript);
        } catch (spawnErr) {
            console.error('Python spawn error:', spawnErr.message);
            return res.status(500).json({ error: spawnErr.message });
        }

        let resultData = '';
        let errorData = '';

        pythonProcess.stdin.write(JSON.stringify(forecastInput));
        pythonProcess.stdin.end();

        pythonProcess.stdout.on('data', (data) => {
            resultData += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            errorData += data.toString();
        });

        pythonProcess.on('error', (err) => {
            console.error('Python process error:', err.message);
            if (!res.headersSent) {
                res.status(500).json({
                    error: 'Failed to start Python interpreter. Ensure Python 3 is installed.',
                    details: err.message,
                });
            }
        });

        pythonProcess.on('close', (code) => {
            if (res.headersSent) return;

            if (code !== 0) {
                console.error(`Python script exited with code ${code}: ${errorData}`);
                return res.status(500).json({
                    error: 'Prediction script failed',
                    details: errorData || 'Unknown Python error',
                });
            }

            const trimmed = resultData.trim();
            if (!trimmed) {
                return res.status(500).json({ error: 'Python script returned no output' });
            }

            try {
                const prediction = JSON.parse(trimmed);
                if (prediction.error) {
                    return res.status(400).json({ error: prediction.error });
                }
                res.json(prediction);
            } catch (pErr) {
                console.error('Failed to parse Python output:', resultData);
                res.status(500).json({ error: 'Failed to parse prediction result', raw: resultData });
            }
        });

    } catch (error) {
        console.error('Forecast API Error:', error);
        res.status(500).json({ error: 'Server error during forecasting' });
    }
};

exports.getForecast = async (req, res) => {
    try {
        const { from, to, range, search } = req.query;
        let query = {};
        if (req.shopId) {
            query.shopId = req.shopId;
        }

        // 1. Build date range filter
        let dateFilter = {};
        if (from) dateFilter.$gte = new Date(from);
        if (to)   dateFilter.$lte = new Date(to);

        if (!from && range && range !== 'All') {
            const days = parseInt(range.replace('d', ''));
            if (!isNaN(days)) {
                dateFilter.$gte = new Date(Date.now() - days * 86400000);
            }
        }

        // 2. Build search filter
        if (search) {
            const regex = new RegExp(search, 'i');
            query.$or = [
                { productName: regex },
                { category: regex },
                { customerName: regex }
            ];
        }

        if (Object.keys(dateFilter).length > 0) {
            query.date = dateFilter;
        }

        // Use MongoDB Aggregation to group by day and calculate totals
        // This avoids loading 130,000+ records into memory
        const aggregatedData = await Sale.aggregate([
            { $match: query },
            {
                $group: {
                   _id: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: "$date",
                            timezone: "Asia/Kolkata"
                        }
                    },
                    revenue: { $sum: { $multiply: ["$price", "$quantity"] } },
                    totalQuantity: { $sum: "$quantity" },
                    // We also need product-level demand for top products
                    products: {
                        $push: {
                            name: "$productName",
                            qty: "$quantity"
                        }
                    }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        if (!aggregatedData || aggregatedData.length === 0) {
            return res.json({ predictedRevenue: [], predictedDemand: [], productsList: [] });
        }

        // 1. Prepare Daily Revenue for Regression
        // 1. Prepare Daily Revenue for Regression
const sortedDays = aggregatedData.map(d => d._id);
const revenueValues = aggregatedData.map(d => d.revenue);

// Convert dates into actual number of days from the first date
const firstDate = new Date(sortedDays[0]);

const dayIndexes = sortedDays.map(dateString => {
    const currentDate = new Date(dateString);

    return Math.round(
        (currentDate - firstDate) / (1000 * 60 * 60 * 24)
    );
});

console.log('📅 Forecast dates:', sortedDays);
console.log('📊 Actual day indexes:', dayIndexes);
console.log('💰 Revenue values:', revenueValues);

// Linear Regression Y = mX + b
const linearRegression = (xValues, yValues) => {
    const n = yValues.length;

    if (n === 0) {
        return { m: 0, b: 0 };
    }

    if (n === 1) {
        return {
            m: 0,
            b: yValues[0]
        };
    }

    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumXX = 0;

    for (let i = 0; i < n; i++) {
        sumX += xValues[i];
        sumY += yValues[i];
        sumXY += xValues[i] * yValues[i];
        sumXX += xValues[i] * xValues[i];
    }

    const denominator =
        (n * sumXX) - (sumX * sumX);

    if (denominator === 0) {
        return {
            m: 0,
            b: yValues[0]
        };
    }

    const m =
        ((n * sumXY) - (sumX * sumY)) /
        denominator;

    const b =
        (sumY - (m * sumX)) / n;

    return {
        m,
        b,
        n
    };
};

const {
    m: revM,
    b: revB
} = linearRegression(
    dayIndexes,
    revenueValues
);

        // Predict next 30 days revenue
        const lastDateStr = sortedDays[sortedDays.length - 1];
        const lastDate = new Date(lastDateStr);
        const predictedRevenue = [];

        for (let i = 1; i <= 30; i++) {
    const nextDate = new Date(lastDate);
    nextDate.setDate(lastDate.getDate() + i);

    // X value is now based on actual calendar days
    const nextDayIndex =
        Math.round(
            (nextDate - firstDate) / (1000 * 60 * 60 * 24)
        );

    const predictedRev = Math.max(
        0,
        revM * nextDayIndex + revB
    );

    predictedRevenue.push({
        date: nextDate.toISOString().split('T')[0],
        expectedRevenue: Math.round(predictedRev)
    });
}

        // 2. Predict Demand for Top 5 Products
        // Find top 5 products overall from aggregated data
        const productMap = {};
        aggregatedData.forEach(day => {
            day.products.forEach(p => {
                productMap[p.name] = (productMap[p.name] || 0) + p.qty;
            });
        });

        const topProducts = Object.entries(productMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(p => p[0]);

        const predictedDemand = [];
        for (let i = 1; i <= 30; i++) {
            const nextDate = new Date(lastDate);
            nextDate.setDate(lastDate.getDate() + i);
            const demandEntry = { date: nextDate.toISOString().split('T')[0] };

            topProducts.forEach(name => {
                const dayQtyMap = {};
                aggregatedData.forEach(day => {
                   const pMatch = day.products.find(prod => prod.name === name);
                   dayQtyMap[day._id] = pMatch ? pMatch.qty : 0;
                });

                const yVals = sortedDays.map(d => dayQtyMap[d] || 0);

const { m, b } = linearRegression(
    dayIndexes,
    yVals
);

const nextDayIndex =
    Math.round(
        (nextDate - firstDate) / (1000 * 60 * 60 * 24)
    );

const predQty = Math.max(
    0,
    m * nextDayIndex + b
);
                demandEntry[name] = Math.round(predQty);
            });

            predictedDemand.push(demandEntry);
        }

       const historical = aggregatedData.map(day => ({
    date: day._id,
    revenue: Math.round(day.revenue)
}));

const dates = predictedRevenue.map(item => item.date);

const predictions = predictedRevenue.map(item => item.expectedRevenue);

// Compare recent actual revenue with predicted future revenue
const recentHistorical = revenueValues.slice(-7);

const averageHistoricalRevenue =
    recentHistorical.length > 0
        ? recentHistorical.reduce((sum, value) => sum + value, 0) /
          recentHistorical.length
        : 0;

const nextSevenPredictions =
    predictedRevenue
        .slice(0, 7)
        .map(item => item.expectedRevenue);

const averagePredictedRevenue =
    nextSevenPredictions.length > 0
        ? nextSevenPredictions.reduce((sum, value) => sum + value, 0) /
          nextSevenPredictions.length
        : 0;

const growthPercent =
    averageHistoricalRevenue > 0
        ? ((averagePredictedRevenue - averageHistoricalRevenue) /
            averageHistoricalRevenue) * 100
        : 0;

const trend =
    growthPercent > 1
        ? 'upward'
        : growthPercent < -1
            ? 'downward'
            : 'stable';

res.json({
    historical,
    dates,
    predictions,
    trend,
    growth: `${growthPercent.toFixed(1)}%`,
    confidence: revenueValues.length >= 5 ? 'High' : 'Medium',
    message:
    trend === 'upward'
        ? 'Forecast revenue shows an upward trend.'
        : trend === 'downward'
            ? 'Forecast revenue shows a downward trend.'
            : 'Forecast revenue is relatively stable.',

    // Keep the existing forecast information too
    predictedRevenue,
    predictedDemand,
    productsList: topProducts
});

    } catch (error) {
        console.error('Forecast Error:', error);
        res.status(500).json({ error: error.message });
    }
};
