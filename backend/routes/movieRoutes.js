const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movieController');

// Public Movie Discovery Routes
router.get('/movies', movieController.getMovies);
router.get('/movies/:id', movieController.getMovieById);
router.get('/genres', movieController.getGenres);
router.get('/languages', movieController.getLanguages);

module.exports = router;
