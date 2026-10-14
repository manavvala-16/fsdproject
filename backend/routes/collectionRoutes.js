const express = require('express');
const router = express.Router();
const collectionController = require('../controllers/collectionController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/collections', verifyToken, collectionController.getCollections);
router.post('/collections', verifyToken, collectionController.createCollection);
router.get('/collections/:id', verifyToken, collectionController.getCollectionById);
router.put('/collections/:id', verifyToken, collectionController.updateCollection);
router.delete('/collections/:id', verifyToken, collectionController.deleteCollection);
router.post('/collections/:id/movies', verifyToken, collectionController.addMovieToCollection);
router.delete('/collections/:id/movies/:movieId', verifyToken, collectionController.removeMovieFromCollection);

module.exports = router;
