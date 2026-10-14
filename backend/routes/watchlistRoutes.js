const express = require('express');
const router = express.Router();
const watchlistController = require('../controllers/watchlistController');
const { verifyToken } = require('../middleware/authMiddleware');

// Protected Watchlist Routes (Requires JWT Token)
router.get('/watchlist', verifyToken, watchlistController.getWatchlist);
router.post('/watchlist', verifyToken, watchlistController.addToWatchlist);
router.delete('/watchlist/:movieId', verifyToken, watchlistController.removeFromWatchlist);

module.exports = router;
