const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/movies/:movieId/ratings', verifyToken, ratingController.getMovieRatings);
router.post('/movies/:movieId/rating', verifyToken, ratingController.submitRating);
router.put('/movies/:movieId/rating', verifyToken, ratingController.updateRating);
router.delete('/movies/:movieId/rating', verifyToken, ratingController.deleteRating);

module.exports = router;
