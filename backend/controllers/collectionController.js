const { pool, testConnection } = require('../config/db');
const { fallbackMovies } = require('./movieController');

const inMemoryCollections = [
  {
    id: 1,
    userId: 2,
    name: 'Late Night Cinema',
    description: 'Perfect for slow, moody movie nights.',
    isPublic: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    movieIds: [1, 6]
  }
];

const movieExists = async (movieId) => {
  const dbCheck = await testConnection();
  if (dbCheck.connected) {
    const [rows] = await pool.query('SELECT id FROM movies WHERE id = ?', [movieId]);
    return rows.length > 0;
  }
  return fallbackMovies.some((movie) => movie.id === movieId);
};

const mapCollectionRow = (row, movieRows = []) => ({
  id: row.id,
  userId: row.user_id,
  name: row.name,
  description: row.description,
  isPublic: Boolean(row.is_public),
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  movieCount: movieRows.length,
  movies: movieRows.map((movie) => ({
    id: movie.id,
    title: movie.title,
    poster_url: movie.poster_url,
    release_year: movie.release_year
  }))
});

exports.getCollections = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const dbCheck = await testConnection();

    if (dbCheck.connected) {
      const [rows] = await pool.query(
        `SELECT c.id, c.user_id, c.name, c.description, c.is_public, c.created_at, c.updated_at,
                COUNT(cm.movie_id) AS movie_count
         FROM collections c
         LEFT JOIN collection_movies cm ON cm.collection_id = c.id
         WHERE c.user_id = ?
         GROUP BY c.id, c.user_id, c.name, c.description, c.is_public, c.created_at, c.updated_at
         ORDER BY c.updated_at DESC`,
        [userId]
      );

      const collections = await Promise.all(rows.map(async (row) => {
        const [movies] = await pool.query(
          `SELECT m.id, m.title, m.poster_url, m.release_year
           FROM collection_movies cm
           JOIN movies m ON m.id = cm.movie_id
           WHERE cm.collection_id = ?
           ORDER BY cm.added_at DESC`,
          [row.id]
        );
        return mapCollectionRow(row, movies);
      }));

      return res.status(200).json({ success: true, data: collections });
    }

    const userCollections = inMemoryCollections.filter((entry) => entry.userId === userId).map((entry) => ({
      ...entry,
      movieCount: entry.movieIds.length,
      isPublic: entry.isPublic,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
      movies: entry.movieIds.map((movieId) => {
        const movie = fallbackMovies.find((item) => item.id === movieId);
        return movie ? { id: movie.id, title: movie.title, poster_url: movie.poster_url, release_year: movie.release_year } : null;
      }).filter(Boolean)
    }));

    return res.status(200).json({ success: true, data: userCollections });
  } catch (error) {
    next(error);
  }
};

exports.createCollection = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const name = (req.body.name || '').trim();
    const description = (req.body.description || '').trim();
    const isPublic = Boolean(req.body.isPublic ?? req.body.is_public ?? true);

    if (!name) {
      return res.status(400).json({ success: false, message: 'Collection name is required.' });
    }

    if (name.length > 100) {
      return res.status(400).json({ success: false, message: 'Collection name must be under 100 characters.' });
    }

    const dbCheck = await testConnection();
    if (dbCheck.connected) {
      const [result] = await pool.query(
        'INSERT INTO collections (user_id, name, description, is_public) VALUES (?, ?, ?, ?)',
        [userId, name, description, isPublic]
      );

      return res.status(201).json({
        success: true,
        message: 'Collection created successfully.',
        data: {
          id: result.insertId,
          userId,
          name,
          description,
          isPublic,
          movieCount: 0,
          movies: []
        }
      });
    }

    const newCollection = {
      id: inMemoryCollections.length ? Math.max(...inMemoryCollections.map((entry) => entry.id)) + 1 : 1,
      userId,
      name,
      description,
      isPublic,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      movieIds: []
    };
    inMemoryCollections.push(newCollection);

    return res.status(201).json({
      success: true,
      message: 'Collection created successfully.',
      data: {
        ...newCollection,
        movieCount: 0,
        movies: []
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getCollectionById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const collectionId = Number.parseInt(req.params.id, 10);

    const dbCheck = await testConnection();
    if (dbCheck.connected) {
      const [rows] = await pool.query(
        `SELECT c.id, c.user_id, c.name, c.description, c.is_public, c.created_at, c.updated_at
         FROM collections c
         WHERE c.id = ?`,
        [collectionId]
      );

      if (rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Collection not found.' });
      }

      if (rows[0].user_id !== userId && rows[0].is_public === 0) {
        return res.status(403).json({ success: false, message: 'You do not have access to this collection.' });
      }

      const [movies] = await pool.query(
        `SELECT m.id, m.title, m.poster_url, m.release_year
         FROM collection_movies cm
         JOIN movies m ON m.id = cm.movie_id
         WHERE cm.collection_id = ?
         ORDER BY cm.added_at DESC`,
        [collectionId]
      );

      return res.status(200).json({
        success: true,
        data: mapCollectionRow(rows[0], movies)
      });
    }

    const collection = inMemoryCollections.find((entry) => entry.id === collectionId);
    if (!collection) {
      return res.status(404).json({ success: false, message: 'Collection not found.' });
    }
    if (collection.userId !== userId && !collection.isPublic) {
      return res.status(403).json({ success: false, message: 'You do not have access to this collection.' });
    }

    return res.status(200).json({
      success: true,
      data: {
        ...collection,
        isPublic: collection.isPublic,
        movieCount: collection.movieIds.length,
        movies: collection.movieIds.map((movieId) => {
          const movie = fallbackMovies.find((item) => item.id === movieId);
          return movie ? { id: movie.id, title: movie.title, poster_url: movie.poster_url, release_year: movie.release_year } : null;
        }).filter(Boolean)
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.updateCollection = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const collectionId = Number.parseInt(req.params.id, 10);
    const name = (req.body.name || '').trim();
    const description = (req.body.description || '').trim();
    const isPublic = req.body.isPublic !== undefined ? Boolean(req.body.isPublic) : undefined;

    if (!Number.isInteger(collectionId) || collectionId <= 0) {
      return res.status(400).json({ success: false, message: 'Valid collection ID is required.' });
    }

    const dbCheck = await testConnection();
    if (dbCheck.connected) {
      const [rows] = await pool.query('SELECT user_id FROM collections WHERE id = ?', [collectionId]);
      if (rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Collection not found.' });
      }
      if (rows[0].user_id !== userId) {
        return res.status(403).json({ success: false, message: 'You can only update your own collection.' });
      }

      const updates = [];
      const params = [];
      if (name) {
        updates.push('name = ?');
        params.push(name);
      }
      if (description !== '') {
        updates.push('description = ?');
        params.push(description);
      }
      if (isPublic !== undefined) {
        updates.push('is_public = ?');
        params.push(isPublic ? 1 : 0);
      }

      if (updates.length === 0) {
        return res.status(400).json({ success: false, message: 'No changes were provided.' });
      }

      params.push(collectionId);
      await pool.query(`UPDATE collections SET ${updates.join(', ')} WHERE id = ?`, params);
      return res.status(200).json({ success: true, message: 'Collection updated successfully.' });
    }

    const collectionIndex = inMemoryCollections.findIndex((entry) => entry.id === collectionId);
    if (collectionIndex === -1) {
      return res.status(404).json({ success: false, message: 'Collection not found.' });
    }
    if (inMemoryCollections[collectionIndex].userId !== userId) {
      return res.status(403).json({ success: false, message: 'You can only update your own collection.' });
    }

    if (name) inMemoryCollections[collectionIndex].name = name;
    if (description !== '') inMemoryCollections[collectionIndex].description = description;
    if (isPublic !== undefined) inMemoryCollections[collectionIndex].isPublic = isPublic;
    inMemoryCollections[collectionIndex].updatedAt = new Date().toISOString();

    return res.status(200).json({ success: true, message: 'Collection updated successfully.' });
  } catch (error) {
    next(error);
  }
};

exports.deleteCollection = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const collectionId = Number.parseInt(req.params.id, 10);

    const dbCheck = await testConnection();
    if (dbCheck.connected) {
      const [rows] = await pool.query('SELECT user_id FROM collections WHERE id = ?', [collectionId]);
      if (rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Collection not found.' });
      }
      if (rows[0].user_id !== userId) {
        return res.status(403).json({ success: false, message: 'You can only delete your own collection.' });
      }

      await pool.query('DELETE FROM collections WHERE id = ?', [collectionId]);
      return res.status(200).json({ success: true, message: 'Collection deleted successfully.' });
    }

    const collectionIndex = inMemoryCollections.findIndex((entry) => entry.id === collectionId);
    if (collectionIndex === -1) {
      return res.status(404).json({ success: false, message: 'Collection not found.' });
    }
    if (inMemoryCollections[collectionIndex].userId !== userId) {
      return res.status(403).json({ success: false, message: 'You can only delete your own collection.' });
    }

    inMemoryCollections.splice(collectionIndex, 1);
    return res.status(200).json({ success: true, message: 'Collection deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

exports.addMovieToCollection = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const collectionId = Number.parseInt(req.params.id, 10);
    const movieId = Number.parseInt(req.body.movieId || req.body.movie_id, 10);

    if (!Number.isInteger(movieId) || movieId <= 0) {
      return res.status(400).json({ success: false, message: 'Valid movie ID is required.' });
    }

    if (!(await movieExists(movieId))) {
      return res.status(404).json({ success: false, message: 'Movie not found.' });
    }

    const dbCheck = await testConnection();
    if (dbCheck.connected) {
      const [rows] = await pool.query('SELECT user_id FROM collections WHERE id = ?', [collectionId]);
      if (rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Collection not found.' });
      }
      if (rows[0].user_id !== userId) {
        return res.status(403).json({ success: false, message: 'You can only modify your own collection.' });
      }

      const [existing] = await pool.query(
        'SELECT collection_id FROM collection_movies WHERE collection_id = ? AND movie_id = ?',
        [collectionId, movieId]
      );
      if (existing.length > 0) {
        return res.status(400).json({ success: false, message: 'This movie is already in the collection.' });
      }

      await pool.query('INSERT INTO collection_movies (collection_id, movie_id) VALUES (?, ?)', [collectionId, movieId]);
      return res.status(201).json({ success: true, message: 'Movie added to collection.' });
    }

    const collection = inMemoryCollections.find((entry) => entry.id === collectionId);
    if (!collection) {
      return res.status(404).json({ success: false, message: 'Collection not found.' });
    }
    if (collection.userId !== userId) {
      return res.status(403).json({ success: false, message: 'You can only modify your own collection.' });
    }
    if (collection.movieIds.includes(movieId)) {
      return res.status(400).json({ success: false, message: 'This movie is already in the collection.' });
    }

    collection.movieIds.push(movieId);
    collection.updatedAt = new Date().toISOString();
    return res.status(201).json({ success: true, message: 'Movie added to collection.' });
  } catch (error) {
    next(error);
  }
};

exports.removeMovieFromCollection = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const collectionId = Number.parseInt(req.params.id, 10);
    const movieId = Number.parseInt(req.params.movieId, 10);

    const dbCheck = await testConnection();
    if (dbCheck.connected) {
      const [rows] = await pool.query('SELECT user_id FROM collections WHERE id = ?', [collectionId]);
      if (rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Collection not found.' });
      }
      if (rows[0].user_id !== userId) {
        return res.status(403).json({ success: false, message: 'You can only modify your own collection.' });
      }

      const [result] = await pool.query(
        'DELETE FROM collection_movies WHERE collection_id = ? AND movie_id = ?',
        [collectionId, movieId]
      );
      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Movie not found in this collection.' });
      }

      return res.status(200).json({ success: true, message: 'Movie removed from collection.' });
    }

    const collection = inMemoryCollections.find((entry) => entry.id === collectionId);
    if (!collection) {
      return res.status(404).json({ success: false, message: 'Collection not found.' });
    }
    if (collection.userId !== userId) {
      return res.status(403).json({ success: false, message: 'You can only modify your own collection.' });
    }

    const index = collection.movieIds.indexOf(movieId);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Movie not found in this collection.' });
    }

    collection.movieIds.splice(index, 1);
    collection.updatedAt = new Date().toISOString();
    return res.status(200).json({ success: true, message: 'Movie removed from collection.' });
  } catch (error) {
    next(error);
  }
};

module.exports.inMemoryCollections = inMemoryCollections;
