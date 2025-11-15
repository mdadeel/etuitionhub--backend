// Express server for e-tuitionBD
// Handles all API routes for the tuition platform
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware setup - keeping it simple for now
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Import routes
const userRoutes = require('./routes/userRoutes');
const tutorRoutes = require('./routes/tutorRoutes');
const tuitionRoutes = require('./routes/tuitionRoutes');
const authRoutes = require('./routes/authRoutes');

// MongoDB connection - using mongoose
// Using MongoDB Atlas - cluster: etuitionbd
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://guluutub_db_user:0lYFJeiRXvOmgDDR@etuitionbd.wrixhq2.mongodb.net/e-tuitionBD?retryWrites=true&w=majority';

const connectDB = async () => {
    try {
        // Using newer connection options
        await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        console.log('✅ MongoDB connected successfully!');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        // Show more details for debugging
        if (error.message.includes('bad auth')) {
            console.log('💡 Tip: Check your MongoDB Atlas database user credentials');
            console.log('💡 Make sure the user has "Read and Write to Any Database" permission');
        }
    }
};

// Connect to database
connectDB();

// Use routes
app.use('/api/users', userRoutes);
app.use('/api/tutors', tutorRoutes);
app.use('/api/tuitions', tuitionRoutes);
app.use('/api/auth', authRoutes);
const bookingRoutes = require('./routes/bookingRoutes');
app.use('/api/bookings', bookingRoutes);
// adding application routes - for tutor applications
const applicationRoutes = require('./routes/applicationRoutes');
app.use('/api/applications', applicationRoutes);
// payment routes - stripe checkout
const paymentRoutes = require('./routes/paymentRoutes')
app.use('/api/payments', paymentRoutes)

// Basic routes
app.get('/', (req, res) => {
    res.json({ message: 'e-tuitionBD API is running', status: 'ok' });
});

// Health check route - needed for deployment
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Start server
app.listen(port, () => {
    console.log(`Backend running on port ${port}`);
    console.log('MongoDB URI:', MONGODB_URI.substring(0, 30) + '...');
});
