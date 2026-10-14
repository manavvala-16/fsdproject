const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

// All admin routes require authenticated session with 'admin' role
router.use(verifyToken, requireRole('admin'));

// Platform Stats
router.get('/stats', adminController.getPlatformStats);

// Movie Management
router.get('/movies', adminController.getAdminMovies);
router.post('/movies', adminController.createMovie);
router.put('/movies/:id', adminController.updateMovie);
router.delete('/movies/:id', adminController.deleteMovie);

// User Management
router.get('/users', adminController.getAdminUsers);
router.put('/users/:id/role', adminController.updateUserRole);

// Review Moderation
router.get('/reviews', adminController.getAdminReviews);
router.delete('/reviews/:id', adminController.deleteAdminReview);

module.exports = router;
