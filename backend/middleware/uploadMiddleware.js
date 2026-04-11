const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Disk storage config — unique timestamped filename
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
        const safeName = file.originalname.replace(/\s+/g, '_');
        cb(null, `${Date.now()}-${safeName}`);
    }
});

// Only allow CSV files
const fileFilter = (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const mime = file.mimetype;

    const isCSV =
        ext === '.csv' ||
        mime === 'text/csv' ||
        mime === 'application/vnd.ms-excel' ||
        mime === 'application/csv' ||
        mime === 'text/plain';

    if (isCSV) {
        cb(null, true);
    } else {
        cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'Only CSV files are allowed'));
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 500 * 1024 * 1024 } // 500 MB max
});

// Single-file upload middleware with built-in error handling
const uploadSingle = (req, res, next) => {
    upload.single('file')(req, res, (err) => {
        if (!err) return next();

        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ error: 'File exceeds 500MB limit.', status: 'failed' });
            }
            if (err.code === 'LIMIT_UNEXPECTED_FILE') {
                return res.status(400).json({ error: err.field || 'Only CSV files are allowed.' });
            }
            return res.status(400).json({ error: `Upload error: ${err.message}` });
        }

        // Unknown error
        return res.status(500).json({ error: 'File upload failed. Please try again.' });
    });
};

module.exports = { uploadSingle };
