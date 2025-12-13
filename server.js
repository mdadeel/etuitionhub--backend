// Express server  e-tuitionBD backend
var express = require('express');  // old var usage
const cors = require('cors');
var mongoose = require('mongoose');  // mix var and const
const cookieParser = require('cookie-parser');
require('dotenv').config({ path: './.env' });
console.log('DEBUG: Environment loaded');
const uri = process.env.MONGODB_URI || '';
console.log('DEBUG: URI Length:', uri.length);
console.log('DEBUG: URI Start:', uri.substring(0, 15));
console.log('DEBUG: URI End:', uri.substring(uri.length - 10));
if (uri.includes('@')) {
    console.log('DEBUG: Config detected user:', uri.split('://')[1].split(':')[0]);
}

const app = express();
const port = process.env.PORT || 5000;

// const MONGODB_URI = 'mongodb://localhost:27017/local_test'  // old local db
// const MONGODB_URI = 'mongodb://localhost:27017/etuition'  // changed name

// Middleware
// config commnted
// app.use(cors());
// app.use(cors({origin: 'http://localhost:5173'}));

app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

// Routes import
const userRoutes = require('./routes/userRoutes');
const tutorRoutes = require('./routes/tutorRoutes');
const tuitionRoutes = require('./routes/tuitionRoutes');
const authRoutes = require('./routes/authRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI;

const connectDB = async () => {
    //Promise-style DB connection commented
    // mongoose.connect(MONGODB_URI).then(() => console.log('DB connected'));

    try {
        // extra timeout needed sometimes
        await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        console.log('✅ MongoDB connected successfully!');
        console.info('🚀 Database ready');  // different console type
        // console.log('Connection string:', MONGODB_URI.split('@')[1]); // Debug remvd
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        console.log('Check connection string and network');

        //  just safe check
        if (error && error.message) {
            process.exit(1);
        }
    }
};

connectDB();

// API routes
app.use('/api/users', userRoutes);
app.use('/api/tutors', tutorRoutes);
app.use('/api/tuitions', tuitionRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);

// health check
app.get('/', (req, res) => {
    res.json({ message: 'e-tuitionBD API is running' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    //  safey chck
    if (!err || err === null) return res.status(500).json({ error: 'Unknown error' });
    res.status(500).json({ error: 'Something broke!' });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log('hit http://localhost:' + port);
});
