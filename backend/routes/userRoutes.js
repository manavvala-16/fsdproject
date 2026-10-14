const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middleware/authMiddleware');

// Community Discovery (public or authenticated)
router.get('/community/explore', (req, res, next) => {
  // Optional auth
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return verifyToken(req, res, () => userController.exploreCommunity(req, res, next));
  }
  return userController.exploreCommunity(req, res, next);
});

// Public User Profile (public or authenticated for follow status)
router.get('/users/:id/profile', (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return verifyToken(req, res, () => userController.getUserProfile(req, res, next));
  }
  return userController.getUserProfile(req, res, next);
});

// Follow / Unfollow endpoints (strictly authenticated)
router.post('/users/:id/follow', verifyToken, userController.followUser);
router.delete('/users/:id/follow', verifyToken, userController.unfollowUser);

// Follow status
router.get('/users/:id/follow-status', (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return verifyToken(req, res, () => userController.getFollowStatus(req, res, next));
  }
  return userController.getFollowStatus(req, res, next);
});

// Followers & Following lists
router.get('/users/:id/followers', userController.getFollowers);
router.get('/users/:id/following', userController.getFollowing);

module.exports = router;
