const express = require('express');
const router = express.Router();
const watchHistoryController = require('../controllers/watchHistoryController');
const { verifyToken } = require('../middleware/authMiddleware');

// Protected Viewing History Routes (Requires JWT Token)
router.get('/watch-history', verifyToken, watchHistoryController.getWatchHistory);
router.post('/watch-history', verifyToken, watchHistoryController.markAsWatched);
router.delete('/watch-history/:movieId', verifyToken, watchHistoryController.removeFromWatchHistory);

module.exports = router;
