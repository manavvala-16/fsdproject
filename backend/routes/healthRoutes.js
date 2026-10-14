const express = require('express');
const router = express.Router();
const healthController = require('../controllers/healthController');

// GET /api/health
router.get('/health', healthController.getHealthStatus);

module.exports = router;
