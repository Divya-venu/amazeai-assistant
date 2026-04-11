const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Multer with absolute path and file size limits
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir); // absolute path — always correct regardless of CWD
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB max per file
    fileFilter: (req, file, cb) => {
        if (file.mimetype === "text/csv" || file.mimetype === "application/vnd.ms-excel" || file.originalname.endsWith(".csv")) {
            cb(null, true);
        } else {
            cb(new Error("Only CSV files are allowed!"), false);
        }
    }
});

const csv = require("csv-parser");
const Sale = require("../models/Sale");

/**
 * @route   POST /api/upload-datasets
 * @desc    Upload multiple CSV files and parse data into DB
 * @access  Public
 */
router.post("/", upload.array("files"), async (req, res) => {
    console.log("[Backend] Upload request received.");
    try {
        if (!req.files || req.files.length === 0) {
            console.warn("[Backend] No files received by Multer.");
            return res.status(400).json({ error: "No files provided. Please select a CSV file." });
        }

        let totalProcessed = 0;
        let allParsedData = [];

        console.log(`[Upload Datasets] Processing ${req.files.length} files...`);
        for (const file of req.files) {
            console.log(`[Upload Datasets] Parsing file: ${file.originalname} at ${file.path}`);
            
            await new Promise((resolve, reject) => {
                let batch = [];
                const BATCH_SIZE = 1000;
                let fileRecordCount = 0;

                const stream = fs.createReadStream(file.path).pipe(csv());

                stream.on('data', (data) => {
                    // Safe string conversion before replace()
                    const productName = data['Title'] || data['Product Name'] || data['Item'] || data['productName'] || 'Unknown Product';
                    const category = data['Category'] || data['Type'] || data['category'] || 'General';
                    const priceStr = (data['Amount'] || data['Price'] || data['price'] || '0').toString();
                    const price = parseFloat(priceStr.replace(/[^0-9.-]+/g, "")) || 0;

                    const qtyStr = (data['Qty'] || data['Quantity'] || data['quantity'] || '1').toString();
                    const quantity = parseInt(qtyStr.replace(/[^0-9]+/g, ''), 10) || 1;

                    const dateStr = data['Date'] || data['date'] || data['Order Date'] || data['order_date'];
                    const date = dateStr ? new Date(dateStr) : new Date();

                    let costPriceStr = data['Cost Price'] || data['costPrice'];
                    let costPrice = costPriceStr
                        ? parseFloat(costPriceStr.toString().replace(/[^0-9.-]+/g, ""))
                        : (price * 0.7);

                    if (isNaN(costPrice)) costPrice = price * 0.7;

                    const country = data['Country'] || data['country'] || data['ship-country'] || data['Shipping Country']
                        || data['Region'] || data['region'] || data['Location'] || data['Market'] || 'Unknown';

                    const revenue = data['Amount'] || data['Revenue'] || data['revenue'] || null;

                    const record = {
                        productName,
                        category,
                        price,
                        costPrice,
                        quantity,
                        date: isNaN(date.getTime()) ? new Date() : date,
                        country,
                        ...(revenue !== null ? { revenue: parseFloat(revenue.toString().replace(/[^0-9.-]+/g, '')) || price * quantity } : {}),
                    };

                    batch.push(record);
                    allParsedData.push(record);

                    if (batch.length >= BATCH_SIZE) {
                        Sale.insertMany(batch).catch(err => console.error("Batch insert error:", err));
                        fileRecordCount += batch.length;
                        batch = [];
                    }
                });

                stream.on('end', async () => {
                    try {
                        if (batch.length > 0) {
                            await Sale.insertMany(batch);
                            fileRecordCount += batch.length;
                        }
                        console.log(`[Upload Datasets] Finished ${file.originalname}: ${fileRecordCount} records.`);
                        totalProcessed += fileRecordCount;
                        resolve();
                    } catch (err) {
                        console.error(`[Upload Datasets] Error in end event for ${file.originalname}:`, err.message);
                        reject(err);
                    }
                });

                stream.on('error', (err) => {
                    console.error(`[Upload Datasets] Stream error for ${file.originalname}:`, err.message);
                    reject(err);
                });
            });
        }

        // Emit Real-time Socket Event
        const io = req.app.get('io');
        if (io) {
            io.emit('salesUpdated', { message: 'New CSV data uploaded.' });
        }

        console.log(`[Backend] Successfully processed ${totalProcessed} records.`);
        res.status(200).json({
            success: true,
            message: "Files uploaded and parsed successfully",
            count: totalProcessed,
            data: allParsedData.slice(0, 500) // Send a sample back for immediate insight generation
        });

    } catch (error) {
        console.error("[Upload Datasets Error]:", error);
        res.status(500).json({ error: "Server Error during file upload", details: error.message });
    }
});

module.exports = router;
