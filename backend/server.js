const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const healthRoutes = require('./routes/healthRoutes');
const authRoutes = require('./routes/authRoutes');
const movieRoutes = require('./routes/movieRoutes');
const watchlistRoutes = require('./routes/watchlistRoutes');
const watchHistoryRoutes = require('./routes/watchHistoryRoutes');
const ratingRoutes = require('./routes/ratingRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const collectionRoutes = require('./routes/collectionRoutes');
const userRoutes = require('./routes/userRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const errorHandler = require('./middleware/errorHandler');
const { testConnection } = require('./config/db');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Register API Routes
app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', movieRoutes);
app.use('/api', watchlistRoutes);
app.use('/api', watchHistoryRoutes);
app.use('/api', ratingRoutes);
app.use('/api', reviewRoutes);
app.use('/api', collectionRoutes);
app.use('/api', userRoutes);
app.use('/api', recommendationRoutes);
app.use('/api/admin', adminRoutes);

// Root route welcome message
app.get('/', (req, res) => {
  res.json({
    message: 'CineVault API is running.'
  });
});

// 404 Route Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.originalUrl} not found`
  });
});

// Global Error Handler
app.use(errorHandler);

// Start Server and verify DB connection
app.listen(PORT, async () => {
  console.log(`====================================================`);
  console.log(`  🎬 CineVault Backend API Server Running`);
  console.log(`  Listening on: http://localhost:${PORT}`);
  console.log(`  Health Endpoint: http://localhost:${PORT}/api/health`);
  console.log(`  Auth Endpoints: http://localhost:${PORT}/api/auth/*`);
  console.log(`  Movie Endpoints: http://localhost:${PORT}/api/movies`);
  console.log(`  Watchlist Endpoints: http://localhost:${PORT}/api/watchlist`);
  console.log(`  History Endpoints: http://localhost:${PORT}/api/watch-history`);
  console.log(`====================================================`);

  // Verify MySQL Connection on startup
  const dbStatus = await testConnection();
  if (dbStatus.connected) {
    console.log(`  ✅ MySQL Database: CONNECTED (${dbStatus.database}@${dbStatus.host}:${dbStatus.port})`);
  } else {
    console.log(`  ⚠️ MySQL Database: DISCONNECTED (${dbStatus.error || 'Server offline'})`);
  }
  console.log(`====================================================`);
});
