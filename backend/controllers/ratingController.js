const { pool, testConnection } = require('../config/db');
const { fallbackMovies } = require('./movieController');

const inMemoryRatings = [
  { userId: 2, movieId: 1, rating: 5 },
  { userId: 2, movieId: 2, rating: 4 }
];

const normalizeRating = (value) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  return Number(parsed.toFixed(1));
};

const movieExists = async (movieId) => {
  const dbCheck = await testConnection();
  if (dbCheck.connected) {
    const [rows] = await pool.query('SELECT id FROM movies WHERE id = ?', [movieId]);
    return rows.length > 0;
  }
  return fallbackMovies.some((movie) => movie.id === movieId);
};

exports.getMovieRatings = async (req, res, next) => {
  try {
    const movieId = Number.parseInt(req.params.movieId, 10);
    if (!Number.isInteger(movieId) || movieId <= 0) {
      return res.status(400).json({ success: false, message: 'Valid movie ID is required.' });
    }

    if (!(await movieExists(movieId))) {
      return res.status(404).json({ success: false, message: 'Movie not found.' });
    }

    const userId = req.user.id;
    const dbCheck = await testConnection();

    if (dbCheck.connected) {
      const [ratingRows] = await pool.query(
        `SELECT r.id, r.user_id, r.rating, r.created_at, u.name AS user_name
         FROM ratings r
         JOIN users u ON u.id = r.user_id
         WHERE r.movie_id = ?
         ORDER BY r.created_at DESC`,
        [movieId]
      );

      const [avgRow] = await pool.query(
        `SELECT AVG(rating) AS average_rating, COUNT(*) AS total_ratings
         FROM ratings WHERE movie_id = ?`,
        [movieId]
      );

      const [userRatingRows] = await pool.query(
        'SELECT rating FROM ratings WHERE movie_id = ? AND user_id = ?',
        [movieId, userId]
      );

      return res.status(200).json({
        success: true,
        data: {
          averageRating: avgRow[0]?.average_rating ? Number(parseFloat(avgRow[0].average_rating).toFixed(1)) : 0,
          totalRatings: Number(avgRow[0]?.total_ratings || 0),
          userRating: userRatingRows[0]?.rating ? Number(userRatingRows[0].rating) : null,
          ratings: ratingRows.map((entry) => ({
            id: entry.id,
            userId: entry.user_id,
            userName: entry.user_name,
            rating: Number(entry.rating),
            createdAt: entry.created_at
          }))
        }
      });
    }

    const movieRatings = inMemoryRatings.filter((entry) => entry.movieId === movieId);
    const userRating = movieRatings.find((entry) => entry.userId === userId)?.rating ?? null;
    const averageRating = movieRatings.length
      ? Number((movieRatings.reduce((sum, entry) => sum + entry.rating, 0) / movieRatings.length).toFixed(1))
      : 0;

    return res.status(200).json({
      success: true,
      data: {
        averageRating,
        totalRatings: movieRatings.length,
        userRating,
        ratings: movieRatings.map((entry) => ({
          id: `${entry.userId}-${entry.movieId}`,
          userId: entry.userId,
          rating: entry.rating,
          userName: `User ${entry.userId}`,
          createdAt: new Date().toISOString()
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.submitRating = async (req, res, next) => {
  try {
    const movieId = Number.parseInt(req.params.movieId, 10);
    const userId = req.user.id;
    const rating = normalizeRating(req.body.rating);

    if (!Number.isInteger(movieId) || movieId <= 0) {
      return res.status(400).json({ success: false, message: 'Valid movie ID is required.' });
    }

    if (rating === null || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5.' });
    }

    if (!(await movieExists(movieId))) {
      return res.status(404).json({ success: false, message: 'Movie not found.' });
    }

    const dbCheck = await testConnection();

    if (dbCheck.connected) {
      const [existing] = await pool.query(
        'SELECT id FROM ratings WHERE user_id = ? AND movie_id = ?',
        [userId, movieId]
      );

      if (existing.length > 0) {
        await pool.query('UPDATE ratings SET rating = ? WHERE user_id = ? AND movie_id = ?', [rating, userId, movieId]);
        return res.status(200).json({
          success: true,
          message: 'Your rating has been updated.',
          data: { rating }
        });
      }

      await pool.query(
        'INSERT INTO ratings (user_id, movie_id, rating) VALUES (?, ?, ?)',
        [userId, movieId, rating]
      );

      return res.status(201).json({
        success: true,
        message: 'Rating submitted successfully.',
        data: { rating }
      });
    }

    const existingIndex = inMemoryRatings.findIndex((entry) => entry.userId === userId && entry.movieId === movieId);
    if (existingIndex >= 0) {
      inMemoryRatings[existingIndex].rating = rating;
      return res.status(200).json({
        success: true,
        message: 'Your rating has been updated.',
        data: { rating }
      });
    }

    inMemoryRatings.push({ userId, movieId, rating });
    return res.status(201).json({
      success: true,
      message: 'Rating submitted successfully.',
      data: { rating }
    });
  } catch (error) {
    next(error);
  }
};

exports.updateRating = async (req, res, next) => {
  return exports.submitRating(req, res, next);
};

exports.deleteRating = async (req, res, next) => {
  try {
    const movieId = Number.parseInt(req.params.movieId, 10);
    const userId = req.user.id;

    if (!Number.isInteger(movieId) || movieId <= 0) {
      return res.status(400).json({ success: false, message: 'Valid movie ID is required.' });
    }

    const dbCheck = await testConnection();

    if (dbCheck.connected) {
      const [result] = await pool.query(
        'DELETE FROM ratings WHERE user_id = ? AND movie_id = ?',
        [userId, movieId]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'You do not have a rating for this movie.' });
      }

      return res.status(200).json({ success: true, message: 'Your rating has been removed.' });
    }

    const existingIndex = inMemoryRatings.findIndex((entry) => entry.userId === userId && entry.movieId === movieId);
    if (existingIndex === -1) {
      return res.status(404).json({ success: false, message: 'You do not have a rating for this movie.' });
    }

    inMemoryRatings.splice(existingIndex, 1);
    return res.status(200).json({ success: true, message: 'Your rating has been removed.' });
  } catch (error) {
    next(error);
  }
};

module.exports.inMemoryRatings = inMemoryRatings;
