const Sale = require('../models/Sale');
const { generateEmbedding } = require('../config/vectorDB');

exports.createSale = async (req, res) => {
    const { productName, category, price, costPrice, quantity, customerName, paymentMethod, date } = req.body;

    try {
        const contentToEmbed = `Product: ${productName}, Category: ${category}, Customer: ${customerName}`;
        const vector = await generateEmbedding(contentToEmbed);

        const sale = await Sale.create({
    productName,
    category,
    price,
    costPrice,
    quantity,
    profit: (price - costPrice) * quantity,
    customerName,
    paymentMethod,
    date: date || new Date(),
    embedding: vector
});

        // Emit real-time update
        const io = req.app.get('io');
        if (io) {
            io.emit('salesUpdated', { action: 'create', sale });
        }

        res.status(201).json(sale);
    } catch (error) {
        console.error('Create Sale Error:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.seedSales = async (req, res) => {
    // ... we don't need this as we have seed_sales.js script, but we can update it or leave it
    // Updated to match schema
    const sampleData = [
        { productName: "Black Formal Shirt", category: "Shirt", price: 1200, costPrice: 800, quantity: 2, customerName: "Ravi Kumar", paymentMethod: "UPI", date: "2026-02-25" },
        { productName: "Slim Fit Jeans", category: "Jeans", price: 2000, costPrice: 1500, quantity: 1, customerName: "Manoj", paymentMethod: "Cash", date: "2026-02-26" }
    ];

    try {
        const count = await Sale.countDocuments();
        if (count > 0) {
            return res.status(200).json({ message: "Collection not empty, seeding skipped", count });
        }

        const seededData = await Promise.all(sampleData.map(async (item) => {
            const contentToEmbed = `Product: ${item.productName}, Category: ${item.category}, Customer: ${item.customerName}`;
            const vector = await generateEmbedding(contentToEmbed);
            return {
            ...item,
             profit: (item.price - item.costPrice) * item.quantity,
                embedding: vector
        };
        }));

        await Sale.insertMany(seededData);
        res.status(201).json({ message: "Successfully seeded sample sales records", data: seededData });
    } catch (error) {
        console.error('Seed Sales Error:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.getAllSales = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 100;
        const skip = (page - 1) * limit;

        const sales = await Sale.find()
            .select('-embedding')
            .sort({ date: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Sale.countDocuments();

        res.json({
            sales,
            page,
            pages: Math.ceil(total / limit),
            total
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteSale = async (req, res) => {
    try {
        const sale = await Sale.findByIdAndDelete(req.params.id);
        if (!sale) {
            return res.status(404).json({ error: 'Sale not found' });
        }

        // Emit real-time update
        const io = req.app.get('io');
        if (io) {
            io.emit('salesUpdated', { action: 'delete', id: req.params.id });
        }

        res.json({ message: 'Sale deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateSale = async (req, res) => {
    try {
        // Need to find it first, then save to trigger pre('save') hook for profit
        const sale = await Sale.findById(req.params.id);
        if (!sale) {
            return res.status(404).json({ error: 'Sale not found' });
        }

        const allowedUpdates = ['productName', 'category', 'price', 'costPrice', 'quantity', 'customerName', 'paymentMethod', 'date'];
        
        // Update fields
        let contentChanged = false;
        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) {
                sale[field] = req.body[field];
                if (['productName', 'category', 'customerName'].includes(field)) {
                    contentChanged = true;
                }
            }
        });

        if (contentChanged) {
             const contentToEmbed = `Product: ${sale.productName}, Category: ${sale.category}, Customer: ${sale.customerName}`;
             sale.embedding = await generateEmbedding(contentToEmbed);
        }

        await sale.save();
        
        // Emit real-time update
        const io = req.app.get('io');
        if (io) {
            io.emit('salesUpdated', { action: 'update', sale });
        }

        res.json(sale);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Summary endpoint Implementation
exports.getSalesSummary = async (req, res) => {
    try {
        const { from, to, range, search, q } = req.query;
        const searchTerm = q || search;
        console.log(`[Backend] getSalesSummary called with: searchTerm="${searchTerm || ''}", range="${range || ''}", from="${from || ''}", to="${to || ''}"`);

        // 1. Build date range filter
        let dateFilter = {};
        if (from) dateFilter.$gte = new Date(from);
        if (to)   dateFilter.$lte = new Date(to);

        // If no explicit dates, use range (e.g. '7d', '30d', '90d')
        if (!from && range && range !== 'All') {
            const days = parseInt(range.replace('d', ''));
            if (!isNaN(days)) {
                dateFilter.$gte = new Date(Date.now() - days * 86400000);
            }
        }

        // 2. Build search filter (regex)
        let searchFilter = {};
        if (searchTerm) {
            const regex = new RegExp(searchTerm, 'i');
            searchFilter = {
                $or: [
                    { productName: regex },
                    { category: regex },
                    { customerName: regex }
                ]
            };
        }

        // 3. Combine filters for Match Stage
        const matchStage = [];
        const combinedMatch = { ...searchFilter };
        if (Object.keys(dateFilter).length > 0) {
            combinedMatch.date = dateFilter;
        }

        if (Object.keys(combinedMatch).length > 0) {
            matchStage.push({ $match: combinedMatch });
        }

        const stats = await Sale.aggregate([
            ...matchStage,
            {
                $facet: {
                    // Overall totals
                    totals: [
                        {
                            $group: {
                                _id: null,
                                totalRevenue: { $sum: { $multiply: ["$price", "$quantity"] } },
                                totalExpenses: { $sum: { $multiply: ["$costPrice", "$quantity"] } },
                                netProfit: {
    $sum: {
        $multiply: [
            { $subtract: ["$price", "$costPrice"] },
            "$quantity"
        ]
    }
}
                            }
                        }
                    ],
                    // Monthly breakdown
                    monthlyData: [
                        {
                            $group: {
                                _id: { $dateToString: { format: "%Y-%m", date: "$date" } },
                                revenue: { $sum: { $multiply: ["$price", "$quantity"] } },
                                expenses: { $sum: { $multiply: ["$costPrice", "$quantity"] } },
                                netProfit: {
    $sum: {
        $multiply: [
            { $subtract: ["$price", "$costPrice"] },
            "$quantity"
        ]
    }
}
                            }
                        },
                        { $sort: { "_id": 1 } }
                    ],
                    // Top products
                    topProducts: [
                        {
                            $group: {
                                _id: "$productName",
                                count: { $sum: "$quantity" }
                            }
                        },
                        { $sort: { count: -1 } },
                        { $limit: 5 }
                    ]
                }
            }
        ]);

        const result = stats[0];
        const summary = result.totals[0] || { totalRevenue: 0, totalExpenses: 0, netProfit: 0 };
        const profitMargin = summary.totalRevenue > 0 ? ((summary.netProfit / summary.totalRevenue) * 100).toFixed(2) : 0;

        const finalResponse = {
            summary: {
                totalRevenue: summary.totalRevenue,
                totalExpenses: summary.totalExpenses,
                netProfit: summary.netProfit,
                profitMargin: `${profitMargin}%`
            },
            monthlyBreakdown: result.monthlyData.map(d => ({
                month: d._id,
                revenue: d.revenue,
                expenses: d.expenses,
                netProfit: d.netProfit
            })),
            topSellingProducts: result.topProducts.map(p => ({
                product: p._id,
                count: p.count
            }))
        };

        console.log('Backend: getSalesSummary response:', JSON.stringify(finalResponse.summary));
        res.json(finalResponse);

    } catch (error) {
        console.error('Sales Summary Error:', error);
        res.status(500).json({ error: error.message });
    }
};
