require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const auth = require('./middleware/auth');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from uploads directory
const path = require('path');
const fs = require('fs');
const uploadsDir = path.join(__dirname, 'uploads');

// Create uploads directory if it doesn't exist
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve static files
app.use('/uploads', express.static(uploadsDir));

// Connect to MongoDB
const connectDB = async () => {
  try {
    // Hide connection string from logs
    const dbUri = process.env.MONGODB_URI;
    const dbName = dbUri.split('/').pop().split('?')[0];
    
    await mongoose.connect(dbUri, {
      serverSelectionTimeoutMS: 30000, // Increase timeout to 30s
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000
    });
    
    console.log('✅ Connected to MongoDB');
    console.log(`📂 Database: ${dbName}`);
    
    // Test connection by listing collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📚 Collections:', collections.map(c => c.name));
    
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    console.error('Please check your internet connection and MongoDB Atlas whitelist settings');
    process.exit(1);
  }
};

// Handle MongoDB connection events
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to DB');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected');
});

// Connect to database
connectDB();

// MongoDB connection events
mongoose.connection.on('connected', () => {
  console.log('MongoDB connection established');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB connection disconnected');
});

// Add error handling for all database operations
mongoose.connection.on('open', () => {
  mongoose.set('debug', (collectionName, method, query, doc) => {
    console.log(`MongoDB ${method} on ${collectionName}:`, query, doc);
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', auth, profileRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
