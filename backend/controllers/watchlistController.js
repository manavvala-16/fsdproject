const { pool, testConnection } = require('../config/db');

// In-memory fallback watchlist repository when MySQL server is offline during local testing
const inMemoryWatchlists = [
  { userId: 2, movieId: 1, created_at: new Date() },
  { userId: 2, movieId: 6, created_at: new Date() }
];

/**
 * GET /api/watchlist
 * Retrieve authenticated user's watchlist movies
 */
exports.getWatchlist = async (req, res, next) => {
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
          w.created_at AS added_to_watchlist_at,
          d.name AS director_name,
          COALESCE(AVG(r.rating), 8.5) AS avg_rating,
          GROUP_CONCAT(DISTINCT g.name) AS genre_list
        FROM watchlists w
        JOIN movies m ON w.movie_id = m.id
        LEFT JOIN directors d ON m.director_id = d.id
        LEFT JOIN movie_genres mg ON m.id = mg.movie_id
        LEFT JOIN genres g ON mg.genre_id = g.id
        LEFT JOIN ratings r ON m.id = r.movie_id
        WHERE w.user_id = ?
        GROUP BY m.id, w.created_at, d.name
        ORDER BY w.created_at DESC
      `;

      const [rows] = await pool.query(query, [userId]);

      const watchlistMovies = rows.map(movie => ({
        ...movie,
        avg_rating: parseFloat(parseFloat(movie.avg_rating).toFixed(1)),
        genres: movie.genre_list ? movie.genre_list.split(',') : []
      }));

      return res.status(200).json({
        success: true,
        data: watchlistMovies
      });
    }

    // Fallback mode for watchlist
    const movieController = require('./movieController');
    const fallbackIds = inMemoryWatchlists
      .filter(w => w.userId === userId)
      .map(w => w.movieId);

    const movies = [];
    for (const id of fallbackIds) {
      const fakeReq = { params: { id } };
      let foundMovie = null;
      const fakeRes = {
        status: () => ({ json: (d) => { foundMovie = d.data; } })
      };
      await movieController.getMovieById(fakeReq, fakeRes, () => {});
      if (foundMovie) movies.push(foundMovie);
    }

    return res.status(200).json({
      success: true,
      data: movies
    });

  } catch (error) {
    console.error('getWatchlist Error:', error);
    next(error);
  }
};

/**
 * POST /api/watchlist
 * Add a movie to user's watchlist
 */
exports.addToWatchlist = async (req, res, next) => {
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

      // 2. Check for duplicate entry
      const [existing] = await pool.query(
        'SELECT id FROM watchlists WHERE user_id = ? AND movie_id = ?',
        [userId, movieId]
      );

      if (existing.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Movie is already in your watchlist.'
        });
      }

      // 3. Insert into watchlist
      await pool.query(
        'INSERT INTO watchlists (user_id, movie_id) VALUES (?, ?)',
        [userId, movieId]
      );

      return res.status(201).json({
        success: true,
        message: 'Movie added to your watchlist.'
      });
    }

    // Fallback mode
    const exists = inMemoryWatchlists.some(w => w.userId === userId && w.movieId === movieId);
    if (exists) {
      return res.status(400).json({
        success: false,
        message: 'Movie is already in your watchlist.'
      });
    }

    inMemoryWatchlists.push({ userId, movieId, created_at: new Date() });
    return res.status(201).json({
      success: true,
      message: 'Movie added to your watchlist.'
    });

  } catch (error) {
    console.error('addToWatchlist Error:', error);
    next(error);
  }
};

/**
 * DELETE /api/watchlist/:movieId
 * Remove a movie from user's watchlist
 */
exports.removeFromWatchlist = async (req, res, next) => {
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
        'DELETE FROM watchlists WHERE user_id = ? AND movie_id = ?',
        [userId, movieId]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'Movie was not in your watchlist.'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Movie removed from your watchlist.'
      });
    }

    // Fallback mode
    const idx = inMemoryWatchlists.findIndex(w => w.userId === userId && w.movieId === movieId);
    if (idx !== -1) {
      inMemoryWatchlists.splice(idx, 1);
    }

    return res.status(200).json({
      success: true,
      message: 'Movie removed from your watchlist.'
    });

  } catch (error) {
    console.error('removeFromWatchlist Error:', error);
    next(error);
  }
};
