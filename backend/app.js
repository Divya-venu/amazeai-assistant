const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const assistantRoutes = require('./routes/assistantRoutes');
const saleRoutes = require('./routes/saleRoutes');
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const errorHandler = require('./middleware/errorMiddleware');
const logger = require('./utils/logger');

const app = express();
app.set('trust proxy', 1);

// Middleware
app.use(helmet());
app.use(compression());
app.use(cookieParser());
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ extended: true, limit: '500mb' }));

// CORS Configuration
const allowedOrigins = [
    process.env.CORS_ORIGIN,
    'https://amazeai-assistant-chi.vercel.app',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3001',
    'http://localhost:3002',
    'http://localhost:5173',
    'http://127.0.0.1:5173'
].filter(Boolean);



app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            var msg = 'The CORS policy for this site does not ' +
                'allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true
}));

// Global Request Logger (Production-Ready)
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`);
    next();
});

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per IP
    message: "Too many requests from this IP, please try again later"
});
app.use('/api', limiter);

// Routes
app.use('/api/assistant', assistantRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/api/preferences', require('./routes/preferencesRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/analytics', require('./routes/analytics')); // Original analytics
app.use('/api/ai-chat', require('./routes/aiChatRoute'));
app.use('/api/upload', require('./routes/upload')); // Core DB upload
app.use('/api/upload-csv', require('./routes/uploadCsvRoutes')); // Streaming analytics upload
app.use('/api/whatsapp', require('./routes/whatsappRoutes'));
// app.use('/api/ai/chat', require('./routes/aiChat')); // Renamed for exact requirement
app.use('/api/insights', require('./routes/insights'));
app.use('/api/forecast', require('./routes/forecastRoutes'));
app.use('/api/ai-recommendations', require('./routes/recommendationsRoutes'));
app.use('/api/anomaly-detection', require('./routes/anomalyDetectionRoutes'));
app.use('/api/smart-alerts', require('./routes/smartAlertsRoutes'));
app.use('/api/predictions', require('./routes/mlRoutes'));

// Health Check
app.get('/health', (req, res) => res.send('API is running...'));

// Global Error Handler
app.use(errorHandler);

module.exports = app;
