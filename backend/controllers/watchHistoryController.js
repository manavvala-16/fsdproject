const { pool, testConnection } = require('../config/db');

// In-memory fallback watch history repository when MySQL server is offline during local testing
const inMemoryHistory = [
  { userId: 2, movieId: 2, watched_at: new Date() }
];

/**
 * GET /api/watch-history
 * Retrieve authenticated user's viewing history
 */
exports.getWatchHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const dbCheck = await testConnection();

    if (dbCheck.connected) {
      const query = `
        SELECT 
          m.id,
          m.title,
          m.description,
          m.release_year,
          m.language,
          m.runtime,
          m.poster_url,
          m.backdrop_url,
          wh.watched_at,
          d.name AS director_name,
          COALESCE(AVG(r.rating), 8.5) AS avg_rating,
          GROUP_CONCAT(DISTINCT g.name) AS genre_list
        FROM watch_history wh
        JOIN movies m ON wh.movie_id = m.id
        LEFT JOIN directors d ON m.director_id = d.id
        LEFT JOIN movie_genres mg ON m.id = mg.movie_id
        LEFT JOIN genres g ON mg.genre_id = g.id
        LEFT JOIN ratings r ON m.id = r.movie_id
        WHERE wh.user_id = ?
        GROUP BY m.id, wh.watched_at, d.name
        ORDER BY wh.watched_at DESC
      `;

      const [rows] = await pool.query(query, [userId]);

      const historyMovies = rows.map(movie => ({
        ...movie,
        avg_rating: parseFloat(parseFloat(movie.avg_rating).toFixed(1)),
        genres: movie.genre_list ? movie.genre_list.split(',') : []
      }));

      return res.status(200).json({
        success: true,
        data: historyMovies
      });
    }

    // Fallback mode for watch history
    const movieController = require('./movieController');
    const userHistory = inMemoryHistory.filter(h => h.userId === userId);

    const movies = [];
    for (const h of userHistory) {
      const fakeReq = { params: { id: h.movieId } };
      let foundMovie = null;
      const fakeRes = {
        status: () => ({ json: (d) => { foundMovie = d.data; } })
      };
      await movieController.getMovieById(fakeReq, fakeRes, () => {});
      if (foundMovie) {
        movies.push({
          ...foundMovie,
          watched_at: h.watched_at
        });
      }
    }

    return res.status(200).json({
      success: true,
      data: movies
    });

  } catch (error) {
    console.error('getWatchHistory Error:', error);
    next(error);
  }
};

/**
 * POST /api/watch-history
 * Mark a movie as watched for authenticated user
 */
exports.markAsWatched = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const movieId = parseInt(req.body.movieId || req.body.movie_id, 10);

    if (!movieId || isNaN(movieId)) {
      return res.status(400).json({
        success: false,
        message: 'Valid movie ID is required.'
      });
    }

    const dbCheck = await testConnection();

    if (dbCheck.connected) {
      // 1. Verify movie exists
      const [movies] = await pool.query('SELECT id FROM movies WHERE id = ?', [movieId]);
      if (movies.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Movie not found.'
        });
      }

      // 2. Check if already in history
      const [existing] = await pool.query(
        'SELECT id FROM watch_history WHERE user_id = ? AND movie_id = ?',
        [userId, movieId]
      );

      if (existing.length > 0) {
        // Update watched timestamp
        await pool.query(
          'UPDATE watch_history SET watched_at = CURRENT_TIMESTAMP WHERE user_id = ? AND movie_id = ?',
          [userId, movieId]
        );
        return res.status(200).json({
          success: true,
          message: 'Movie marked as watched (updated watched timestamp).'
        });
      }

      // Insert new history record
      await pool.query(
        'INSERT INTO watch_history (user_id, movie_id, watched_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
        [userId, movieId]
      );

      return res.status(201).json({
        success: true,
        message: 'Movie marked as watched.'
      });
    }

    // Fallback mode
    const existing = inMemoryHistory.find(h => h.userId === userId && h.movieId === movieId);
    if (existing) {
      existing.watched_at = new Date();
      return res.status(200).json({
        success: true,
        message: 'Movie marked as watched (updated watched timestamp).'
      });
    }

    inMemoryHistory.push({ userId, movieId, watched_at: new Date() });
    return res.status(201).json({
      success: true,
      message: 'Movie marked as watched.'
    });

  } catch (error) {
    console.error('markAsWatched Error:', error);
    next(error);
  }
};

/**
 * DELETE /api/watch-history/:movieId
 * Remove a movie from user's viewing history
 */
exports.removeFromWatchHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const movieId = parseInt(req.params.movieId, 10);

    if (isNaN(movieId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid movie ID.'
      });
    }

    const dbCheck = await testConnection();

    if (dbCheck.connected) {
      const [result] = await pool.query(
        'DELETE FROM watch_history WHERE user_id = ? AND movie_id = ?',
        [userId, movieId]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'Movie was not in your viewing history.'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Movie removed from viewing history.'
      });
    }

    // Fallback mode
    const idx = inMemoryHistory.findIndex(h => h.userId === userId && h.movieId === movieId);
    if (idx !== -1) {
      inMemoryHistory.splice(idx, 1);
    }

    return res.status(200).json({
      success: true,
      message: 'Movie removed from viewing history.'
    });

  } catch (error) {
    console.error('removeFromWatchHistory Error:', error);
    next(error);
  }
};

module.exports.inMemoryHistory = inMemoryHistory;
