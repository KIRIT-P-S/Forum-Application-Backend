const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load env vars - specify path explicitly
dotenv.config({ path: path.join(__dirname, '../.env') });

// Add these debug lines
console.log('🔑 Checking API Keys:');
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'Found ✅' : 'Not found ❌');

// Debug: Check if env vars are loaded
console.log('PORT:', process.env.PORT);
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Found ' : 'Not found ');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Found ' : 'Not found ');

// Connect to database
connectDB();
// Initialize app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/threads', require('./routes/threads'));
app.use('/api/replies', require('./routes/replies'));
app.use('/api/ai', require('./routes/ai'));

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Forum API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});
