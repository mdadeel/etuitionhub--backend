const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const path = require('path');
const http = require('http');
const { Server } = require("socket.io");
require('dotenv').config({ path: path.resolve(__dirname, './.env') });

// console.log('env loaded'); // debug

const app = express();
const port = process.env.PORT || 5000;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:3000',
        'https://e-tuitionhub.vercel.app',
        'https://etuitionhub.vercel.app'
    ],
    methods: ["GET", "POST"]
  }
});

// Socket.io WebRTC Signaling
io.on("connection", (socket) => {
    socket.on("join-room", (roomId, userId) => {
        socket.join(roomId);
        socket.to(roomId).emit("user-connected", userId);

        socket.on("disconnect", () => {
            socket.to(roomId).emit("user-disconnected", userId);
        });
        
        socket.on("signal", (data) => {
            io.to(data.room).emit("signal", {
                userId: data.userId,
                signal: data.signal
            });
        });
        
        socket.on("chat-message", (data) => {
            io.to(data.room).emit("chat-message", data);
        });
    });
});

// Middleware - CORS setup for local dev and production
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:3000',
        'https://e-tuitionhub.vercel.app',  // Production frontend
        'https://etuitionhub.vercel.app'    // Alternative frontend URL
    ],
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Route Imports
const userRoutes = require('./routes/userRoutes');
const tutorRoutes = require('./routes/tutorRoutes');
const tuitionRoutes = require('./routes/tuitionRoutes');
const authRoutes = require('./routes/authRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const settingRoutes = require('./routes/settingRoutes');

// Error handling utilities
const AppError = require('./utils/AppError');

// Database Connection with serverless optimization
const MONGODB_URI = process.env.MONGODB_URI;
// const MONGODB_URI = "mongodb://localhost:27017/etuition"; // local fallback

let isConnected = false; // connection cache for serverless

const connectDB = async () => {
    // Prevent multiple connections in serverless environment
    if (isConnected && mongoose.connection.readyState === 1) {
        return;
    }

    if (!MONGODB_URI) {
        console.error('❌ MONGODB_URI environment variable is not set!');
        return;
    }

    try {
        // Mask password for safe logging
        const maskedUri = MONGODB_URI.replace(/\/\/(.*):(.*)@/, '//***:***@');
        console.log(`📡 Attempting to connect to: ${maskedUri}`);

        await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            maxPoolSize: 10
            // dbName: 'etuition' // Removed: Data is currently in the default 'test' database.
        });
        
        isConnected = true;
        console.log('✅ MongoDB connected successfully');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        isConnected = false;
    }
};

// Monitor connection events
mongoose.connection.on('error', err => {
    console.error('📡 MongoDB Runtime Error:', err.message);
});

mongoose.connection.on('disconnected', () => {
    console.warn('📡 MongoDB disconnected. Reconnecting...');
    isConnected = false;
});

// connectDB(); // Removed from here

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/tutors', tutorRoutes);
app.use('/api/tuitions', tuitionRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/settings', settingRoutes);

// Health Check
app.get('/', (req, res) => {
    res.json({ message: 'e-tuitionBD API is running' });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found', errorCode: 'NOT_FOUND' });
});

/**
 * Global Error Handler
 * Distinguishes between operational errors (AppError) and programming bugs
 * Sends specific error codes for frontend to handle appropriately
 */
app.use((err, req, res, next) => {
    // Handle known operational errors
    if (err.isOperational) {
        return res.status(err.statusCode).json({
            error: err.message,
            errorCode: err.errorCode,
            status: err.status
        });
    }

    // Log unexpected errors for debugging
    console.error('Unexpected Error:', err);

    // Don't leak error details in production
    const isProduction = process.env.NODE_ENV === 'production';
    res.status(500).json({
        error: isProduction ? 'Something went wrong' : err.message,
        errorCode: 'INTERNAL_ERROR'
    });
});

connectDB().then(() => {
    server.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
});
