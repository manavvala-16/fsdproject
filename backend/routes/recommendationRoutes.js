const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendationController');
const { verifyToken } = require('../middleware/authMiddleware');

// Movie DNA Taste Profile (authenticated)
router.get('/recommendations/dna', verifyToken, recommendationController.getMovieDNA);

// Personalized Recommendations (authenticated)
router.get('/recommendations', verifyToken, recommendationController.getRecommendations);

module.exports = router;
