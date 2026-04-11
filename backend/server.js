require('dotenv').config();
const http = require('http');
const socketIo = require('socket.io');
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB()
  .then(() => {
    require('./services/cronJobs'); // Start cron jobs only after DB connects
    
    const server = http.createServer(app);
    
    // Set up Socket.io
    const io = socketIo(server, {
      cors: {
        origin: [process.env.CORS_ORIGIN, 'http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5173', 'http://127.0.0.1:5173'].filter(Boolean),
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true
      }
    });

    // Make io accessible in routes/controllers
    app.set('io', io);

    io.on('connection', (socket) => {
      console.log('New client connected in Real-Time Analytics:', socket.id);
      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });

    server.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
