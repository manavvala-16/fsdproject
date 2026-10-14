const { pool, testConnection } = require('../config/db');
const { fallbackMovies, fallbackGenres } = require('./movieController');
const { inMemoryUsers } = require('./authController');
const { inMemoryRatings } = require('./ratingController');
const { inMemoryReviews } = require('./reviewController');
const { inMemoryCollections } = require('./collectionController');

/**
 * GET /api/admin/stats
 * Platform overview statistics
 */
exports.getPlatformStats = async (req, res, next) => {
  try {
    const dbCheck = await testConnection();

    if (dbCheck.connected) {
      const [[userCountRow]] = await pool.query('SELECT COUNT(*) AS count FROM users');
      const [[movieCountRow]] = await pool.query('SELECT COUNT(*) AS count FROM movies');
      const [[ratingCountRow]] = await pool.query('SELECT COUNT(*) AS count FROM ratings');
      const [[reviewCountRow]] = await pool.query('SELECT COUNT(*) AS count FROM reviews');
      const [[collectionCountRow]] = await pool.query('SELECT COUNT(*) AS count FROM collections WHERE is_public = 1');

      // Recent 5 added movies
      const [recentMovies] = await pool.query(
        `SELECT id, title, release_year, created_at, poster_url
         FROM movies
         ORDER BY id DESC
         LIMIT 5`
      );

      // Recent 5 registered users
      const [recentUsers] = await pool.query(
        `SELECT id, name, email, role, created_at
         FROM users
         ORDER BY id DESC
         LIMIT 5`
      );

      return res.status(200).json({
        success: true,
        data: {
          totalUsers: userCountRow.count,
          totalMovies: movieCountRow.count,
          totalRatings: ratingCountRow.count,
          totalReviews: reviewCountRow.count,
          totalCollections: collectionCountRow.count,
          recentMovies,
          recentUsers
        }
      });
    }

    // Fallback mode stats
    return res.status(200).json({
      success: true,
      data: {
        totalUsers: (inMemoryUsers || []).length,
        totalMovies: (fallbackMovies || []).length,
        totalRatings: (inMemoryRatings || []).length,
        totalReviews: (inMemoryReviews || []).length,
        totalCollections: (inMemoryCollections || []).filter(c => c.isPublic).length,
        recentMovies: (fallbackMovies || []).slice(0, 5).map(m => ({
          id: m.id,
          title: m.title,
          release_year: m.release_year,
          poster_url: m.poster_url,
          created_at: new Date().toISOString()
        })),
        recentUsers: (inMemoryUsers || []).slice(0, 5).map(u => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          created_at: u.created_at || new Date().toISOString()
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/movies
 * List movies with search, pagination, and full metadata
 */
exports.getAdminMovies = async (req, res, next) => {
  try {
    const { search = '', page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 20);
    const offset = (pageNum - 1) * limitNum;

    const dbCheck = await testConnection();
    if (dbCheck.connected) {
      let whereClause = '';
      const params = [];
      if (search.trim()) {
        whereClause = 'WHERE m.title LIKE ? OR d.name LIKE ?';
        params.push(`%${search.trim()}%`, `%${search.trim()}%`);
      }

      const countSql = `
        SELECT COUNT(DISTINCT m.id) AS total
        FROM movies m
        LEFT JOIN directors d ON m.director_id = d.id
        ${whereClause}
      `;
      const [[{ total }]] = await pool.query(countSql, params);

      const moviesSql = `
        SELECT m.id, m.title, m.description, m.release_year, m.language, m.runtime,
               m.poster_url, m.backdrop_url, m.director_id,
               d.name AS director_name,
               GROUP_CONCAT(DISTINCT g.name) AS genre_list,
               COALESCE(AVG(r.rating), 0) AS avg_rating,
               COUNT(DISTINCT r.id) AS ratings_count
        FROM movies m
        LEFT JOIN directors d ON m.director_id = d.id
        LEFT JOIN movie_genres mg ON m.id = mg.movie_id
        LEFT JOIN genres g ON mg.genre_id = g.id
        LEFT JOIN ratings r ON m.id = r.movie_id
        ${whereClause}
        GROUP BY m.id, d.name
        ORDER BY m.id DESC
        LIMIT ? OFFSET ?
      `;

      const [rows] = await pool.query(moviesSql, [...params, limitNum, offset]);

      const movies = rows.map(m => ({
        ...m,
        avg_rating: m.avg_rating ? parseFloat(parseFloat(m.avg_rating).toFixed(1)) : 0,
        genres: m.genre_list ? m.genre_list.split(',').filter(Boolean) : []
      }));

      return res.status(200).json({
        success: true,
        data: movies,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum) || 1,
          totalItems: total,
          limit: limitNum
        }
      });
    }

    // Fallback mode
    let list = fallbackMovies;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(m => m.title.toLowerCase().includes(q) || (m.director_name && m.director_name.toLowerCase().includes(q)));
    }
    const total = list.length;
    const paginated = list.slice(offset, offset + limitNum);

    return res.status(200).json({
      success: true,
      data: paginated,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum) || 1,
        totalItems: total,
        limit: limitNum
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/admin/movies
 * Create a new movie with director and genres
 */
exports.createMovie = async (req, res, next) => {
  try {
    const {
      title,
      description,
      release_year,
      language = 'English',
      runtime,
      poster_url,
      backdrop_url,
      director_name,
      genres = []
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Movie title is required.' });
    }

    const yearNum = parseInt(release_year, 10);
    if (!yearNum || isNaN(yearNum) || yearNum < 1888 || yearNum > 2100) {
      return res.status(400).json({ success: false, message: 'Valid release year is required.' });
    }

    const runtimeNum = parseInt(runtime, 10) || null;

    const dbCheck = await testConnection();
    if (dbCheck.connected) {
      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();

        // 1. Director handling
        let directorId = null;
        if (director_name && director_name.trim()) {
          const [dRows] = await connection.query('SELECT id FROM directors WHERE LOWER(name) = ?', [director_name.trim().toLowerCase()]);
          if (dRows.length > 0) {
            directorId = dRows[0].id;
          } else {
            const [dInsert] = await connection.query('INSERT INTO directors (name) VALUES (?)', [director_name.trim()]);
            directorId = dInsert.insertId;
          }
        }

        // 2. Insert movie
        const [mInsert] = await connection.query(
          `INSERT INTO movies (title, description, release_year, language, runtime, poster_url, backdrop_url, director_id)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [title.trim(), description || '', yearNum, language.trim(), runtimeNum, poster_url || '', backdrop_url || '', directorId]
        );

        const movieId = mInsert.insertId;

        // 3. Genres handling
        if (Array.isArray(genres) && genres.length > 0) {
          for (const gName of genres) {
            const cleanGenre = typeof gName === 'string' ? gName.trim() : '';
            if (!cleanGenre) continue;

            let genreId = null;
            const [gRows] = await connection.query('SELECT id FROM genres WHERE LOWER(name) = ?', [cleanGenre.toLowerCase()]);
            if (gRows.length > 0) {
              genreId = gRows[0].id;
            } else {
              const [gInsert] = await connection.query('INSERT INTO genres (name) VALUES (?)', [cleanGenre]);
              genreId = gInsert.insertId;
            }

            await connection.query('INSERT IGNORE INTO movie_genres (movie_id, genre_id) VALUES (?, ?)', [movieId, genreId]);
          }
        }

        await connection.commit();

        return res.status(201).json({
          success: true,
          message: `Movie "${title}" created successfully.`,
          data: { id: movieId, title }
        });
      } catch (err) {
        await connection.rollback();
        throw err;
      } finally {
        connection.release();
      }
    }

    // Fallback mode
    const newId = Math.max(...fallbackMovies.map(m => m.id), 0) + 1;
    const newMovie = {
      id: newId,
      title: title.trim(),
      description: description || '',
      release_year: yearNum,
      language: language.trim(),
      runtime: runtimeNum,
      poster_url: poster_url || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600',
      backdrop_url: backdrop_url || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200',
      director_name: director_name || 'Independent',
      genres: Array.isArray(genres) ? genres : [],
      actors: [],
      avg_rating: 0,
      ratings_count: 0
    };
    fallbackMovies.unshift(newMovie);

    return res.status(201).json({
      success: true,
      message: `Movie "${title}" created successfully.`,
      data: newMovie
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/admin/movies/:id
 * Edit movie information
 */
exports.updateMovie = async (req, res, next) => {
  try {
    const movieId = parseInt(req.params.id, 10);
    if (!movieId || isNaN(movieId)) {
      return res.status(400).json({ success: false, message: 'Valid movie ID is required.' });
    }

    const {
      title,
      description,
      release_year,
      language,
      runtime,
      poster_url,
      backdrop_url,
      director_name,
      genres
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Movie title is required.' });
    }

    const yearNum = parseInt(release_year, 10);
    const runtimeNum = parseInt(runtime, 10) || null;

    const dbCheck = await testConnection();
    if (dbCheck.connected) {
      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();

        const [existing] = await connection.query('SELECT id FROM movies WHERE id = ?', [movieId]);
        if (existing.length === 0) {
          await connection.rollback();
          connection.release();
          return res.status(404).json({ success: false, message: 'Movie not found.' });
        }

        // Director handling
        let directorId = null;
        if (director_name && director_name.trim()) {
          const [dRows] = await connection.query('SELECT id FROM directors WHERE LOWER(name) = ?', [director_name.trim().toLowerCase()]);
          if (dRows.length > 0) {
            directorId = dRows[0].id;
          } else {
            const [dInsert] = await connection.query('INSERT INTO directors (name) VALUES (?)', [director_name.trim()]);
            directorId = dInsert.insertId;
          }
        }

        // Update movie
        await connection.query(
          `UPDATE movies
           SET title = ?, description = ?, release_year = ?, language = ?, runtime = ?, poster_url = ?, backdrop_url = ?, director_id = ?
           WHERE id = ?`,
          [title.trim(), description || '', yearNum, language || 'English', runtimeNum, poster_url || '', backdrop_url || '', directorId, movieId]
        );

        // Update genres
        if (Array.isArray(genres)) {
          await connection.query('DELETE FROM movie_genres WHERE movie_id = ?', [movieId]);
          for (const gName of genres) {
            const cleanGenre = typeof gName === 'string' ? gName.trim() : '';
            if (!cleanGenre) continue;

            let genreId = null;
            const [gRows] = await connection.query('SELECT id FROM genres WHERE LOWER(name) = ?', [cleanGenre.toLowerCase()]);
            if (gRows.length > 0) {
              genreId = gRows[0].id;
            } else {
              const [gInsert] = await connection.query('INSERT INTO genres (name) VALUES (?)', [cleanGenre]);
              genreId = gInsert.insertId;
            }

            await connection.query('INSERT IGNORE INTO movie_genres (movie_id, genre_id) VALUES (?, ?)', [movieId, genreId]);
          }
        }

        await connection.commit();

        return res.status(200).json({
          success: true,
          message: `Movie "${title}" updated successfully.`
        });
      } catch (err) {
        await connection.rollback();
        throw err;
      } finally {
        connection.release();
      }
    }

    // Fallback mode
    const movieIndex = fallbackMovies.findIndex(m => m.id === movieId);
    if (movieIndex === -1) {
      return res.status(404).json({ success: false, message: 'Movie not found.' });
    }

    fallbackMovies[movieIndex] = {
      ...fallbackMovies[movieIndex],
      title: title.trim(),
      description: description || '',
      release_year: yearNum || fallbackMovies[movieIndex].release_year,
      language: language || fallbackMovies[movieIndex].language,
      runtime: runtimeNum || fallbackMovies[movieIndex].runtime,
      poster_url: poster_url || fallbackMovies[movieIndex].poster_url,
      backdrop_url: backdrop_url || fallbackMovies[movieIndex].backdrop_url,
      director_name: director_name || fallbackMovies[movieIndex].director_name,
      genres: Array.isArray(genres) ? genres : fallbackMovies[movieIndex].genres
    };

    return res.status(200).json({
      success: true,
      message: `Movie "${title}" updated successfully.`
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/admin/movies/:id
 * Delete movie safely (cascades or clears relations via FKs)
 */
exports.deleteMovie = async (req, res, next) => {
  try {
    const movieId = parseInt(req.params.id, 10);
    if (!movieId || isNaN(movieId)) {
      return res.status(400).json({ success: false, message: 'Valid movie ID is required.' });
    }

    const dbCheck = await testConnection();
    if (dbCheck.connected) {
      const [existing] = await pool.query('SELECT title FROM movies WHERE id = ?', [movieId]);
      if (existing.length === 0) {
        return res.status(404).json({ success: false, message: 'Movie not found.' });
      }

      const movieTitle = existing[0].title;
      // Database schema has ON DELETE CASCADE on movie_genres, movie_actors, watchlists, watch_history, ratings, reviews, collection_movies
      await pool.query('DELETE FROM movies WHERE id = ?', [movieId]);

      return res.status(200).json({
        success: true,
        message: `Movie "${movieTitle}" deleted successfully.`
      });
    }

    // Fallback mode
    const idx = fallbackMovies.findIndex(m => m.id === movieId);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Movie not found.' });
    }
    const movieTitle = fallbackMovies[idx].title;
    fallbackMovies.splice(idx, 1);

    return res.status(200).json({
      success: true,
      message: `Movie "${movieTitle}" deleted successfully.`
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/users
 * Search and manage registered users
 */
exports.getAdminUsers = async (req, res, next) => {
  try {
    const { search = '', page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 20);
    const offset = (pageNum - 1) * limitNum;

    const dbCheck = await testConnection();
    if (dbCheck.connected) {
      let whereClause = '';
      const params = [];
      if (search.trim()) {
        whereClause = 'WHERE name LIKE ? OR email LIKE ?';
        params.push(`%${search.trim()}%`, `%${search.trim()}%`);
      }

      const countSql = `SELECT COUNT(*) AS total FROM users ${whereClause}`;
      const [[{ total }]] = await pool.query(countSql, params);

      const usersSql = `
        SELECT u.id, u.name, u.email, u.role, u.created_at,
               (SELECT COUNT(*) FROM ratings WHERE user_id = u.id) AS ratings_count,
               (SELECT COUNT(*) FROM watch_history WHERE user_id = u.id) AS watched_count,
               (SELECT COUNT(*) FROM collections WHERE user_id = u.id) AS collections_count
        FROM users u
        ${whereClause}
        ORDER BY u.id DESC
        LIMIT ? OFFSET ?
      `;

      const [users] = await pool.query(usersSql, [...params, limitNum, offset]);

      return res.status(200).json({
        success: true,
        data: users,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum) || 1,
          totalItems: total,
          limit: limitNum
        }
      });
    }

    // Fallback mode
    let list = inMemoryUsers;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    }
    const total = list.length;
    const paginated = list.slice(offset, offset + limitNum).map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      created_at: u.created_at,
      ratings_count: (inMemoryRatings || []).filter(r => r.userId === u.id).length,
      watched_count: 1,
      collections_count: (inMemoryCollections || []).filter(c => c.userId === u.id).length
    }));

    return res.status(200).json({
      success: true,
      data: paginated,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum) || 1,
        totalItems: total,
        limit: limitNum
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/admin/users/:id/role
 * Change user role (user <-> admin) with self-lockout prevention
 */
exports.updateUserRole = async (req, res, next) => {
  try {
    const targetUserId = parseInt(req.params.id, 10);
    const currentAdminId = req.user.id;
    const { role } = req.body;

    if (!targetUserId || isNaN(targetUserId)) {
      return res.status(400).json({ success: false, message: 'Valid user ID is required.' });
    }

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Role must be either "user" or "admin".' });
    }

    // Prevent accidental self-demotion
    if (targetUserId === currentAdminId && role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Security protection: You cannot demote your own administrator account.'
      });
    }

    const dbCheck = await testConnection();
    if (dbCheck.connected) {
      const [existing] = await pool.query('SELECT id, name FROM users WHERE id = ?', [targetUserId]);
      if (existing.length === 0) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }

      await pool.query('UPDATE users SET role = ? WHERE id = ?', [role, targetUserId]);

      return res.status(200).json({
        success: true,
        message: `Role for ${existing[0].name} updated to "${role}".`
      });
    }

    // Fallback mode
    const user = inMemoryUsers.find(u => u.id === targetUserId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    user.role = role;
    return res.status(200).json({
      success: true,
      message: `Role for ${user.name} updated to "${role}".`
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/reviews
 * View and search reviews for moderation
 */
exports.getAdminReviews = async (req, res, next) => {
  try {
    const { search = '', page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 20);
    const offset = (pageNum - 1) * limitNum;

    const dbCheck = await testConnection();
    if (dbCheck.connected) {
      let whereClause = '';
      const params = [];
      if (search.trim()) {
        whereClause = 'WHERE r.review_text LIKE ? OR m.title LIKE ? OR u.name LIKE ?';
        params.push(`%${search.trim()}%`, `%${search.trim()}%`, `%${search.trim()}%`);
      }

      const countSql = `
        SELECT COUNT(*) AS total
        FROM reviews r
        JOIN movies m ON r.movie_id = m.id
        JOIN users u ON r.user_id = u.id
        ${whereClause}
      `;
      const [[{ total }]] = await pool.query(countSql, params);

      const reviewsSql = `
        SELECT r.id, r.review_text, r.created_at, r.updated_at,
               m.id AS movie_id, m.title AS movie_title, m.poster_url,
               u.id AS user_id, u.name AS user_name, u.email AS user_email,
               rr.rating AS user_rating
        FROM reviews r
        JOIN movies m ON r.movie_id = m.id
        JOIN users u ON r.user_id = u.id
        LEFT JOIN ratings rr ON rr.movie_id = r.movie_id AND rr.user_id = r.user_id
        ${whereClause}
        ORDER BY r.created_at DESC
        LIMIT ? OFFSET ?
      `;

      const [reviews] = await pool.query(reviewsSql, [...params, limitNum, offset]);

      return res.status(200).json({
        success: true,
        data: reviews,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum) || 1,
          totalItems: total,
          limit: limitNum
        }
      });
    }

    // Fallback mode
    let list = inMemoryReviews || [];
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(r => r.reviewText.toLowerCase().includes(q) || (r.userName && r.userName.toLowerCase().includes(q)));
    }
    const total = list.length;
    const paginated = list.slice(offset, offset + limitNum).map(r => {
      const movie = fallbackMovies.find(m => m.id === r.movieId);
      return {
        id: r.id,
        review_text: r.reviewText,
        created_at: r.createdAt,
        movie_id: r.movieId,
        movie_title: movie ? movie.title : 'Movie',
        poster_url: movie ? movie.poster_url : '',
        user_id: r.userId,
        user_name: r.userName || 'Member',
        user_rating: 5
      };
    });

    return res.status(200).json({
      success: true,
      data: paginated,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum) || 1,
        totalItems: total,
        limit: limitNum
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/admin/reviews/:id
 * Moderate/delete inappropriate review
 */
exports.deleteAdminReview = async (req, res, next) => {
  try {
    const reviewId = parseInt(req.params.id, 10);
    if (!reviewId || isNaN(reviewId)) {
      return res.status(400).json({ success: false, message: 'Valid review ID is required.' });
    }

    const dbCheck = await testConnection();
    if (dbCheck.connected) {
      const [result] = await pool.query('DELETE FROM reviews WHERE id = ?', [reviewId]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Review not found.' });
      }

      return res.status(200).json({
        success: true,
        message: 'Review removed successfully by administrator.'
      });
    }

    // Fallback mode
    const idx = (inMemoryReviews || []).findIndex(r => r.id === reviewId);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }
    inMemoryReviews.splice(idx, 1);

    return res.status(200).json({
      success: true,
      message: 'Review removed successfully by administrator.'
    });
  } catch (error) {
    next(error);
  }
};
