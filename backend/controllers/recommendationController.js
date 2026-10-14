const recommendationService = require('../services/recommendationService');

/**
 * GET /api/recommendations/dna
 * Retrieve calculated Movie DNA taste profile for logged-in user
 */
exports.getMovieDNA = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const dna = await recommendationService.calculateMovieDNA(userId);

    return res.status(200).json({
      success: true,
      data: dna
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/recommendations
 * Retrieve personalized film recommendations for logged-in user with explainable reasons
 */
exports.getRecommendations = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit, 10) || 12;

    const result = await recommendationService.getRecommendationsForUser(userId, limit);

    return res.status(200).json({
      success: true,
      data: result.recommendations,
      isPersonalized: result.isPersonalized,
      message: result.message || null
    });
  } catch (error) {
    next(error);
  }
};
