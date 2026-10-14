const { pool, testConnection } = require('../config/db');
const { fallbackMovies } = require('./movieController');

const inMemoryReviews = [
  {
    id: 1,
    userId: 2,
    movieId: 1,
    reviewText: 'An incredible mind-bending masterpiece with gorgeous visuals.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userName: 'John Doe'
  }
];

const normalizeReviewText = (value) => {
  if (typeof value !== 'string') return '';
  return value.trim();
};

const movieExists = async (movieId) => {
  const dbCheck = await testConnection();
  if (dbCheck.connected) {
    const [rows] = await pool.query('SELECT id FROM movies WHERE id = ?', [movieId]);
    return rows.length > 0;
  }
  return fallbackMovies.some((movie) => movie.id === movieId);
};

exports.getMovieReviews = async (req, res, next) => {
  try {
    const movieId = Number.parseInt(req.params.movieId, 10);
    if (!Number.isInteger(movieId) || movieId <= 0) {
      return res.status(400).json({ success: false, message: 'Valid movie ID is required.' });
    }

    if (!(await movieExists(movieId))) {
      return res.status(404).json({ success: false, message: 'Movie not found.' });
    }

    const dbCheck = await testConnection();

    if (dbCheck.connected) {
      const [rows] = await pool.query(
        `SELECT r.id, r.user_id, r.review_text, r.created_at, r.updated_at,
                u.name AS user_name,
                rr.rating AS user_rating
         FROM reviews r
         JOIN users u ON u.id = r.user_id
         LEFT JOIN ratings rr ON rr.user_id = r.user_id AND rr.movie_id = r.movie_id
         WHERE r.movie_id = ?
         ORDER BY r.created_at DESC`,
        [movieId]
      );

      return res.status(200).json({
        success: true,
        data: rows.map((review) => ({
          id: review.id,
          userId: review.user_id,
          userName: review.user_name,
          reviewText: review.review_text,
          userRating: review.user_rating ? Number(review.user_rating) : null,
          createdAt: review.created_at,
          updatedAt: review.updated_at
        }))
      });
    }

    const movieReviews = inMemoryReviews.filter((entry) => entry.movieId === movieId);
    return res.status(200).json({
      success: true,
      data: movieReviews.map((entry) => ({
        id: entry.id,
        userId: entry.userId,
        userName: entry.userName,
        reviewText: entry.reviewText,
        userRating: null,
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt
      }))
    });
  } catch (error) {
    next(error);
  }
};

exports.createReview = async (req, res, next) => {
  try {
    const movieId = Number.parseInt(req.params.movieId, 10);
    const userId = req.user.id;
    const reviewText = normalizeReviewText(req.body.reviewText || req.body.review_text || req.body.text);

    if (!Number.isInteger(movieId) || movieId <= 0) {
      return res.status(400).json({ success: false, message: 'Valid movie ID is required.' });
    }

    if (reviewText.length < 3) {
      return res.status(400).json({ success: false, message: 'Review text must be at least 3 characters long.' });
    }

    if (reviewText.length > 2000) {
      return res.status(400).json({ success: false, message: 'Review text is too long.' });
    }

    if (!(await movieExists(movieId))) {
      return res.status(404).json({ success: false, message: 'Movie not found.' });
    }

    const dbCheck = await testConnection();

    if (dbCheck.connected) {
      const [existing] = await pool.query(
        'SELECT id FROM reviews WHERE user_id = ? AND movie_id = ?',
        [userId, movieId]
      );

      if (existing.length > 0) {
        await pool.query('UPDATE reviews SET review_text = ? WHERE id = ?', [reviewText, existing[0].id]);
        return res.status(200).json({
          success: true,
          message: 'Your review has been updated.',
          data: { id: existing[0].id, reviewText }
        });
      }

      const [result] = await pool.query(
        'INSERT INTO reviews (user_id, movie_id, review_text) VALUES (?, ?, ?)',
        [userId, movieId, reviewText]
      );

      return res.status(201).json({
        success: true,
        message: 'Review submitted successfully.',
        data: { id: result.insertId, reviewText }
      });
    }

    const existingIndex = inMemoryReviews.findIndex((entry) => entry.userId === userId && entry.movieId === movieId);
    if (existingIndex >= 0) {
      inMemoryReviews[existingIndex].reviewText = reviewText;
      inMemoryReviews[existingIndex].updatedAt = new Date().toISOString();
      return res.status(200).json({
        success: true,
        message: 'Your review has been updated.',
        data: { id: inMemoryReviews[existingIndex].id, reviewText }
      });
    }

    const newReview = {
      id: inMemoryReviews.length ? Math.max(...inMemoryReviews.map((r) => r.id)) + 1 : 1,
      userId,
      movieId,
      reviewText,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userName: `User ${userId}`
    };
    inMemoryReviews.push(newReview);
    return res.status(201).json({
      success: true,
      message: 'Review submitted successfully.',
      data: { id: newReview.id, reviewText }
    });
  } catch (error) {
    next(error);
  }
};

exports.updateReview = async (req, res, next) => {
  try {
    const reviewId = Number.parseInt(req.params.id, 10);
    const userId = req.user.id;
    const reviewText = normalizeReviewText(req.body.reviewText || req.body.review_text || req.body.text);

    if (!Number.isInteger(reviewId) || reviewId <= 0) {
      return res.status(400).json({ success: false, message: 'Valid review ID is required.' });
    }

    if (reviewText.length < 3) {
      return res.status(400).json({ success: false, message: 'Review text must be at least 3 characters long.' });
    }

    const dbCheck = await testConnection();

    if (dbCheck.connected) {
      const [rows] = await pool.query('SELECT id, user_id, movie_id FROM reviews WHERE id = ?', [reviewId]);
      if (rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Review not found.' });
      }
      if (rows[0].user_id !== userId) {
        return res.status(403).json({ success: false, message: 'You can only edit your own review.' });
      }

      await pool.query('UPDATE reviews SET review_text = ? WHERE id = ?', [reviewText, reviewId]);
      return res.status(200).json({
        success: true,
        message: 'Review updated successfully.',
        data: { id: reviewId, reviewText }
      });
    }

    const reviewIndex = inMemoryReviews.findIndex((entry) => entry.id === reviewId);
    if (reviewIndex === -1) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }
    if (inMemoryReviews[reviewIndex].userId !== userId) {
      return res.status(403).json({ success: false, message: 'You can only edit your own review.' });
    }

    inMemoryReviews[reviewIndex].reviewText = reviewText;
    inMemoryReviews[reviewIndex].updatedAt = new Date().toISOString();
    return res.status(200).json({
      success: true,
      message: 'Review updated successfully.',
      data: { id: reviewId, reviewText }
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteReview = async (req, res, next) => {
  try {
    const reviewId = Number.parseInt(req.params.id, 10);
    const userId = req.user.id;

    if (!Number.isInteger(reviewId) || reviewId <= 0) {
      return res.status(400).json({ success: false, message: 'Valid review ID is required.' });
    }

    const dbCheck = await testConnection();

    if (dbCheck.connected) {
      const [rows] = await pool.query('SELECT id, user_id FROM reviews WHERE id = ?', [reviewId]);
      if (rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Review not found.' });
      }
      if (rows[0].user_id !== userId) {
        return res.status(403).json({ success: false, message: 'You can only delete your own review.' });
      }

      await pool.query('DELETE FROM reviews WHERE id = ?', [reviewId]);
      return res.status(200).json({ success: true, message: 'Review deleted successfully.' });
    }

    const reviewIndex = inMemoryReviews.findIndex((entry) => entry.id === reviewId);
    if (reviewIndex === -1) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }
    if (inMemoryReviews[reviewIndex].userId !== userId) {
      return res.status(403).json({ success: false, message: 'You can only delete your own review.' });
    }

    inMemoryReviews.splice(reviewIndex, 1);
    return res.status(200).json({ success: true, message: 'Review deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports.inMemoryReviews = inMemoryReviews;

