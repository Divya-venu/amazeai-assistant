const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// HTTP Server & WebSockets
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: '*' } // Allow frontend to connect
});

// Make io accessible to workers (e.g., queueService)
global.io = io;

io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);
    
    // Clients join a room specific to their shopId for secure updates
    socket.on('join_shop', (shopId) => {
        socket.join(shopId);
        console.log(`[Socket] ${socket.id} joined shop: ${shopId}`);
    });

    socket.on('disconnect', () => {
        console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/auth', require('./routes/authRoutes')); // Added Auth Routes
app.get('/health', (req, res) => res.json({ status: 'OK', message: 'AI Agent Backend is running' }));

// Database Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ai-agent-saas')
    .then(() => console.log('MongoDB Connected...'))
    .catch(err => console.error('MongoDB Connection Error:', err));

server.listen(PORT, () => {
    console.log(`Server & WebSockets running on port ${PORT}`);
});
