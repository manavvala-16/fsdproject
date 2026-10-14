const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/movies/:movieId/reviews', reviewController.getMovieReviews);
router.post('/movies/:movieId/reviews', verifyToken, reviewController.createReview);
router.put('/reviews/:id', verifyToken, reviewController.updateReview);
router.delete('/reviews/:id', verifyToken, reviewController.deleteReview);

module.exports = router;
