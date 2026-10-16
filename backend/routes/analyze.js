const path = require('path');
const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const mongoose = require('mongoose');
const Sale = require('../models/Sale');
const AIUsage = require('../models/AIUsage');
const Groq = require('groq-sdk');

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

// Use absolute path so the upload dir is always correct regardless of CWD
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({ dest: uploadDir });

router.post('/', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const results = [];

        fs.createReadStream(req.file.path)
            .pipe(csv())
            .on('data', (data) => {
                // Safe string conversion on all fields before calling .replace()
                // Prevents TypeError when Amazon CSV has null/undefined columns
                const productName = data['Title'] || data['Product Name'] || data['Item'] || data['productName'] || data['SKU'] || 'Unknown Product';
                const category = data['Category'] || data['Type'] || data['category'] || data['Fulfilment'] || 'General';
                const priceStr = (data['Amount'] || data['Price'] || data['price'] || data['Sale Price'] || '0').toString();
                const price = parseFloat(priceStr.replace(/[^0-9.-]+/g,"")) || 0;
                
                const qtyStr = (data['Qty'] || data['Quantity'] || data['quantity'] || data['Qty.'] || '1').toString();
                const quantity = parseInt(qtyStr.replace(/[^0-9]+/g,''), 10) || 1;
                
                const dateStr = data['Date'] || data['date'] || data['Order Date'] || data['order_date'];
                const parsedDate = dateStr ? new Date(dateStr) : new Date();
                const date = isNaN(parsedDate.getTime()) ? new Date() : parsedDate;

                // If costPrice is missing, simulate it (e.g. 70% of price)
                let costPriceStr = data['Cost Price'] || data['costPrice'];
                let costPrice = costPriceStr ? parseFloat(costPriceStr.toString().replace(/[^0-9.-]+/g,"")) : (price * 0.7);

                if (isNaN(costPrice)) costPrice = price * 0.7;

                // Create Sale object. Profit is auto-calculated by the Mongoose pre-save hook.
                results.push({
                    productName,
                    category,
                    price,
                    costPrice,
                    quantity,
                    date,
                    // If shopId or userId was passed, we'd add it here, but Dashboard implies single user or global for now.
                });
            })
            .on('end', async () => {
                try {
                    // Clean up the uploaded file
                    if (fs.existsSync(req.file.path)) {
                        fs.unlinkSync(req.file.path);
                    }

                    if (results.length === 0) {
                        return res.status(400).json({ error: 'No valid data found in CSV.' });
                    }

                    // 1. Insert Data into DB
                    await Sale.insertMany(results);

                    // 2. Prepare Data for AI Analysis
                    // Calculate quick summary for the prompt
                    let totalRevenue = 0;
                    let totalCost = 0;
                    results.forEach(item => {
                        totalRevenue += (item.price * item.quantity);
                        totalCost += (item.costPrice * item.quantity);
                    });
                    const netProfit = totalRevenue - totalCost;

                    const prompt = `
I have just uploaded ${results.length} new sales records to my database.
Summary of the upload:
- Total Revenue: $${totalRevenue.toFixed(2)}
- Total Cost: $${totalCost.toFixed(2)}
- Estimated Net Profit: $${netProfit.toFixed(2)}

Please provide 3 quick, actionable financial insights based on this summary to help me maximize my profit moving forward.
Keep it concise and professional.
`;

                    // 3. Generate AI Insights via Groq
                    const response = await groq.chat.completions.create({
                        model: "openai/gpt-oss-20b",
                        messages: [
                            { role: "system", content: "You are an expert AI Business and Financial Assistant." },
                            { role: "user", content: prompt }
                        ],
                        temperature: 0.7,
                    });

                    const insights = response.choices[0].message.content;

                    // Log AI Usage (optional, catching errors so it doesn't break flow)
                    try {
                        await AIUsage.create({
                            model: "openai/gpt-oss-20b",
                            promptTokens: response.usage.prompt_tokens,
                            completionTokens: response.usage.completion_tokens,
                            totalTokens: response.usage.total_tokens,
                            query: "CSV Upload Analysis"
                        });
                    } catch (usageErr) {
                        console.error('AI Usage logging error:', usageErr.message);
                    }

                    // 4. Emit Real-time Socket Event to refresh dashboard
                    const io = req.app.get('io');
                    if (io) {
                        io.emit('salesUpdated', { message: 'New CSV data uploaded and analyzed.' });
                    }

                    return res.json({
                        success: true,
                        insertedCount: results.length,
                        insights
                    });
                } catch (processError) {
                    console.error("Error processing CSV data:", processError);
                    res.status(500).json({ error: 'Failed to save CSV data to database or generate insights.' });
                }
            })
            .on('error', (err) => {
                console.error("CSV Parsing Error:", err);
                if (fs.existsSync(req.file.path)) {
                    fs.unlinkSync(req.file.path);
                }
                res.status(500).json({ error: 'Failed to process CSV file.' });
            });

    } catch (error) {
        console.error("Analyze Route Error:", error);
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ error: 'Server error processing file' });
    }
});

module.exports = router;
