const { pool, testConnection } = require('../config/db');
const { fallbackMovies } = require('./movieController');
const { inMemoryUsers } = require('./authController');
const { inMemoryRatings } = require('./ratingController');

// In-memory fallback follow relations: followerId follows followingId
const inMemoryFollows = [
  { followerId: 2, followingId: 3, createdAt: new Date().toISOString() },
  { followerId: 3, followingId: 2, createdAt: new Date().toISOString() }
];

/**
 * Helper to check if a user exists by ID
 */
const userExists = async (userId) => {
  const dbCheck = await testConnection();
  if (dbCheck.connected) {
    const [rows] = await pool.query('SELECT id, name FROM users WHERE id = ?', [userId]);
    return rows.length > 0 ? rows[0] : null;
  }
  const u = inMemoryUsers.find(item => item.id === userId);
  return u ? { id: u.id, name: u.name } : null;
};

/**
 * POST /api/users/:id/follow
 * Follow a user (current authenticated user follows :id)
 */
exports.followUser = async (req, res, next) => {
  try {
    const currentUserId = req.user.id;
    const targetUserId = parseInt(req.params.id, 10);

    if (!Number.isInteger(targetUserId) || targetUserId <= 0) {
      return res.status(400).json({ success: false, message: 'Valid user ID is required.' });
    }

    if (currentUserId === targetUserId) {
      return res.status(400).json({ success: false, message: 'You cannot follow yourself.' });
    }

    const targetUser = await userExists(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const dbCheck = await testConnection();
    if (dbCheck.connected) {
      // Check if already following
      const [existing] = await pool.query(
        'SELECT follower_id FROM followers WHERE follower_id = ? AND following_id = ?',
        [currentUserId, targetUserId]
      );

      if (existing.length > 0) {
        return res.status(400).json({ success: false, message: 'You are already following this user.' });
      }

      await pool.query(
        'INSERT INTO followers (follower_id, following_id) VALUES (?, ?)',
        [currentUserId, targetUserId]
      );

      return res.status(200).json({
        success: true,
        message: `You are now following ${targetUser.name || 'this user'}.`,
        isFollowing: true
      });
    }

    // Fallback mode
    const alreadyFollowing = inMemoryFollows.some(
      f => f.followerId === currentUserId && f.followingId === targetUserId
    );
    if (alreadyFollowing) {
      return res.status(400).json({ success: false, message: 'You are already following this user.' });
    }

    inMemoryFollows.push({
      followerId: currentUserId,
      followingId: targetUserId,
      createdAt: new Date().toISOString()
    });

    return res.status(200).json({
      success: true,
      message: `You are now following ${targetUser.name || 'this user'}.`,
      isFollowing: true
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/users/:id/follow
 * Unfollow a user
 */
exports.unfollowUser = async (req, res, next) => {
  try {
    const currentUserId = req.user.id;
    const targetUserId = parseInt(req.params.id, 10);

    if (!Number.isInteger(targetUserId) || targetUserId <= 0) {
      return res.status(400).json({ success: false, message: 'Valid user ID is required.' });
    }

    if (currentUserId === targetUserId) {
      return res.status(400).json({ success: false, message: 'You cannot unfollow yourself.' });
    }

    const targetUser = await userExists(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const dbCheck = await testConnection();
    if (dbCheck.connected) {
      const [result] = await pool.query(
        'DELETE FROM followers WHERE follower_id = ? AND following_id = ?',
        [currentUserId, targetUserId]
      );

      if (result.affectedRows === 0) {
        return res.status(400).json({ success: false, message: 'You are not following this user.' });
      }

      return res.status(200).json({
        success: true,
        message: `You unfollowed ${targetUser.name || 'this user'}.`,
        isFollowing: false
      });
    }

    // Fallback mode
    const index = inMemoryFollows.findIndex(
      f => f.followerId === currentUserId && f.followingId === targetUserId
    );
    if (index === -1) {
      return res.status(400).json({ success: false, message: 'You are not following this user.' });
    }

    inMemoryFollows.splice(index, 1);
    return res.status(200).json({
      success: true,
      message: `You unfollowed ${targetUser.name || 'this user'}.`,
      isFollowing: false
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/users/:id/follow-status
 * Get follow relationship status between authenticated user and :id
 */
exports.getFollowStatus = async (req, res, next) => {
  try {
    const currentUserId = req.user ? req.user.id : null;
    const targetUserId = parseInt(req.params.id, 10);

    if (!Number.isInteger(targetUserId) || targetUserId <= 0) {
      return res.status(400).json({ success: false, message: 'Valid user ID is required.' });
    }

    const targetUser = await userExists(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    let isFollowing = false;
    let followersCount = 0;
    let followingCount = 0;

    const dbCheck = await testConnection();
    if (dbCheck.connected) {
      const [[fCount]] = await pool.query(
        'SELECT COUNT(*) AS count FROM followers WHERE following_id = ?',
        [targetUserId]
      );
      followersCount = fCount.count;

      const [[fgCount]] = await pool.query(
        'SELECT COUNT(*) AS count FROM followers WHERE follower_id = ?',
        [targetUserId]
      );
      followingCount = fgCount.count;

      if (currentUserId && currentUserId !== targetUserId) {
        const [rows] = await pool.query(
          'SELECT follower_id FROM followers WHERE follower_id = ? AND following_id = ?',
          [currentUserId, targetUserId]
        );
        isFollowing = rows.length > 0;
      }
    } else {
      followersCount = inMemoryFollows.filter(f => f.followingId === targetUserId).length;
      followingCount = inMemoryFollows.filter(f => f.followerId === targetUserId).length;
      if (currentUserId && currentUserId !== targetUserId) {
        isFollowing = inMemoryFollows.some(
          f => f.followerId === currentUserId && f.followingId === targetUserId
        );
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        userId: targetUserId,
        isFollowing,
        followersCount,
        followingCount
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/users/:id/followers
 * List of users who follow :id
 */
exports.getFollowers = async (req, res, next) => {
  try {
    const targetUserId = parseInt(req.params.id, 10);
    if (!Number.isInteger(targetUserId) || targetUserId <= 0) {
      return res.status(400).json({ success: false, message: 'Valid user ID is required.' });
    }

    const targetUser = await userExists(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const dbCheck = await testConnection();
    if (dbCheck.connected) {
      const [rows] = await pool.query(
        `SELECT u.id, u.name, u.role, u.created_at, f.created_at AS followed_at
         FROM followers f
         JOIN users u ON u.id = f.follower_id
         WHERE f.following_id = ?
         ORDER BY f.created_at DESC`,
        [targetUserId]
      );

      return res.status(200).json({
        success: true,
        data: rows.map(r => ({
          id: r.id,
          name: r.name,
          role: r.role,
          createdAt: r.created_at,
          followedAt: r.followed_at
        }))
      });
    }

    // Fallback mode
    const followers = inMemoryFollows
      .filter(f => f.followingId === targetUserId)
      .map(f => {
        const u = inMemoryUsers.find(item => item.id === f.followerId);
        return u ? {
          id: u.id,
          name: u.name,
          role: u.role,
          createdAt: u.created_at,
          followedAt: f.createdAt
        } : null;
      })
      .filter(Boolean);

    return res.status(200).json({ success: true, data: followers });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/users/:id/following
 * List of users that :id is following
 */
exports.getFollowing = async (req, res, next) => {
  try {
    const targetUserId = parseInt(req.params.id, 10);
    if (!Number.isInteger(targetUserId) || targetUserId <= 0) {
      return res.status(400).json({ success: false, message: 'Valid user ID is required.' });
    }

    const targetUser = await userExists(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const dbCheck = await testConnection();
    if (dbCheck.connected) {
      const [rows] = await pool.query(
        `SELECT u.id, u.name, u.role, u.created_at, f.created_at AS followed_at
         FROM followers f
         JOIN users u ON u.id = f.following_id
         WHERE f.follower_id = ?
         ORDER BY f.created_at DESC`,
        [targetUserId]
      );

      return res.status(200).json({
        success: true,
        data: rows.map(r => ({
          id: r.id,
          name: r.name,
          role: r.role,
          createdAt: r.created_at,
          followedAt: r.followed_at
        }))
      });
    }

    // Fallback mode
    const following = inMemoryFollows
      .filter(f => f.followerId === targetUserId)
      .map(f => {
        const u = inMemoryUsers.find(item => item.id === f.followingId);
        return u ? {
          id: u.id,
          name: u.name,
          role: u.role,
          createdAt: u.created_at,
          followedAt: f.createdAt
        } : null;
      })
      .filter(Boolean);

    return res.status(200).json({ success: true, data: following });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/users/:id/profile
 * Public user profile with stats and strictly PUBLIC collections
 */
exports.getUserProfile = async (req, res, next) => {
  try {
    const targetUserId = parseInt(req.params.id, 10);
    const currentUserId = req.user ? req.user.id : null;

    if (!Number.isInteger(targetUserId) || targetUserId <= 0) {
      return res.status(400).json({ success: false, message: 'Valid user ID is required.' });
    }

    const dbCheck = await testConnection();
    if (dbCheck.connected) {
      const [userRows] = await pool.query(
        'SELECT id, name, role, created_at FROM users WHERE id = ?',
        [targetUserId]
      );

      if (userRows.length === 0) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }

      const user = userRows[0];

      // Followers / Following counts
      const [[followersRow]] = await pool.query(
        'SELECT COUNT(*) AS count FROM followers WHERE following_id = ?',
        [targetUserId]
      );
      const [[followingRow]] = await pool.query(
        'SELECT COUNT(*) AS count FROM followers WHERE follower_id = ?',
        [targetUserId]
      );

      // Check if current user is following target user
      let isFollowing = false;
      if (currentUserId && currentUserId !== targetUserId) {
        const [fRows] = await pool.query(
          'SELECT follower_id FROM followers WHERE follower_id = ? AND following_id = ?',
          [currentUserId, targetUserId]
        );
        isFollowing = fRows.length > 0;
      }

      // Public collections ONLY
      const [collectionRows] = await pool.query(
        `SELECT c.id, c.name, c.description, c.created_at, c.updated_at,
                COUNT(cm.movie_id) AS movie_count
         FROM collections c
         LEFT JOIN collection_movies cm ON cm.collection_id = c.id
         WHERE c.user_id = ? AND c.is_public = 1
         GROUP BY c.id, c.name, c.description, c.created_at, c.updated_at
         ORDER BY c.updated_at DESC`,
        [targetUserId]
      );

      const publicCollections = await Promise.all(
        collectionRows.map(async (c) => {
          const [movies] = await pool.query(
            `SELECT m.id, m.title, m.poster_url, m.release_year
             FROM collection_movies cm
             JOIN movies m ON m.id = cm.movie_id
             WHERE cm.collection_id = ?
             ORDER BY cm.added_at DESC
             LIMIT 4`,
            [c.id]
          );
          return {
            id: c.id,
            name: c.name,
            description: c.description,
            createdAt: c.created_at,
            updatedAt: c.updated_at,
            movieCount: c.movie_count,
            movies
          };
        })
      );

      // Recent public curation/ratings activity
      const [recentRatings] = await pool.query(
        `SELECT r.rating, r.created_at, m.id AS movie_id, m.title, m.poster_url, m.release_year
         FROM ratings r
         JOIN movies m ON m.id = r.movie_id
         WHERE r.user_id = ?
         ORDER BY r.created_at DESC
         LIMIT 6`,
        [targetUserId]
      );

      return res.status(200).json({
        success: true,
        data: {
          id: user.id,
          name: user.name,
          role: user.role,
          createdAt: user.created_at,
          followersCount: followersRow.count,
          followingCount: followingRow.count,
          isFollowing,
          isSelf: currentUserId === targetUserId,
          collections: publicCollections,
          recentActivity: recentRatings.map(r => ({
            movieId: r.movie_id,
            title: r.title,
            poster_url: r.poster_url,
            releaseYear: r.release_year,
            rating: Number(r.rating),
            createdAt: r.created_at
          }))
        }
      });
    }

    // Fallback mode
    const user = inMemoryUsers.find(u => u.id === targetUserId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const followersCount = inMemoryFollows.filter(f => f.followingId === targetUserId).length;
    const followingCount = inMemoryFollows.filter(f => f.followerId === targetUserId).length;
    const isFollowing = currentUserId
      ? inMemoryFollows.some(f => f.followerId === currentUserId && f.followingId === targetUserId)
      : false;

    // Import collections from collectionController
    const { inMemoryCollections } = require('./collectionController');
    const publicCollections = (inMemoryCollections || [])
      .filter(c => c.userId === targetUserId && c.isPublic)
      .map(c => ({
        id: c.id,
        name: c.name,
        description: c.description,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        movieCount: c.movieIds.length,
        movies: c.movieIds.slice(0, 4).map(mId => {
          const m = fallbackMovies.find(mov => mov.id === mId);
          return m ? { id: m.id, title: m.title, poster_url: m.poster_url, release_year: m.release_year } : null;
        }).filter(Boolean)
      }));

    // User ratings activity
    const userRatings = (inMemoryRatings || [])
      .filter(r => r.userId === targetUserId)
      .slice(0, 6)
      .map(r => {
        const m = fallbackMovies.find(mov => mov.id === r.movieId);
        return m ? {
          movieId: m.id,
          title: m.title,
          poster_url: m.poster_url,
          releaseYear: m.release_year,
          rating: r.rating,
          createdAt: new Date().toISOString()
        } : null;
      }).filter(Boolean);

    return res.status(200).json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        role: user.role,
        createdAt: user.created_at,
        followersCount,
        followingCount,
        isFollowing,
        isSelf: currentUserId === targetUserId,
        collections: publicCollections,
        recentActivity: userRatings
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/community/explore
 * Discover other members, popular public collections, and recently curated collections
 */
exports.exploreCommunity = async (req, res, next) => {
  try {
    const currentUserId = req.user ? req.user.id : null;
    const dbCheck = await testConnection();

    if (dbCheck.connected) {
      // 1. Suggested / active community members (excluding current user)
      let usersQuery = `
        SELECT u.id, u.name, u.role, u.created_at,
               (SELECT COUNT(*) FROM followers WHERE following_id = u.id) AS followers_count,
               (SELECT COUNT(*) FROM collections WHERE user_id = u.id AND is_public = 1) AS public_collections_count
        FROM users u
      `;
      const queryParams = [];
      if (currentUserId) {
        usersQuery += ' WHERE u.id != ?';
        queryParams.push(currentUserId);
      }
      usersQuery += ' ORDER BY followers_count DESC, public_collections_count DESC LIMIT 12';

      const [userRows] = await pool.query(usersQuery, queryParams);

      // Add follow status for each suggested user
      const suggestedMembers = await Promise.all(
        userRows.map(async (u) => {
          let isFollowing = false;
          if (currentUserId) {
            const [fRows] = await pool.query(
              'SELECT follower_id FROM followers WHERE follower_id = ? AND following_id = ?',
              [currentUserId, u.id]
            );
            isFollowing = fRows.length > 0;
          }
          return {
            id: u.id,
            name: u.name,
            role: u.role,
            createdAt: u.created_at,
            followersCount: u.followers_count,
            publicCollectionsCount: u.public_collections_count,
            isFollowing
          };
        })
      );

      // 2. Popular & Recently updated public collections
      const [colRows] = await pool.query(
        `SELECT c.id, c.user_id, c.name, c.description, c.created_at, c.updated_at,
                u.name AS owner_name,
                COUNT(cm.movie_id) AS movie_count
         FROM collections c
         JOIN users u ON u.id = c.user_id
         LEFT JOIN collection_movies cm ON cm.collection_id = c.id
         WHERE c.is_public = 1
         GROUP BY c.id, c.user_id, c.name, c.description, c.created_at, c.updated_at, u.name
         ORDER BY c.updated_at DESC
         LIMIT 12`
      );

      const publicCollections = await Promise.all(
        colRows.map(async (c) => {
          const [movies] = await pool.query(
            `SELECT m.id, m.title, m.poster_url, m.release_year
             FROM collection_movies cm
             JOIN movies m ON m.id = cm.movie_id
             WHERE cm.collection_id = ?
             ORDER BY cm.added_at DESC
             LIMIT 4`,
            [c.id]
          );
          return {
            id: c.id,
            userId: c.user_id,
            ownerName: c.owner_name,
            name: c.name,
            description: c.description,
            createdAt: c.created_at,
            updatedAt: c.updated_at,
            movieCount: c.movie_count,
            movies
          };
        })
      );

      return res.status(200).json({
        success: true,
        data: {
          members: suggestedMembers,
          collections: publicCollections
        }
      });
    }

    // Fallback mode
    const { inMemoryCollections } = require('./collectionController');
    const filteredUsers = inMemoryUsers
      .filter(u => !currentUserId || u.id !== currentUserId)
      .map(u => {
        const followersCount = inMemoryFollows.filter(f => f.followingId === u.id).length;
        const publicCollectionsCount = (inMemoryCollections || []).filter(c => c.userId === u.id && c.isPublic).length;
        const isFollowing = currentUserId
          ? inMemoryFollows.some(f => f.followerId === currentUserId && f.followingId === u.id)
          : false;
        return {
          id: u.id,
          name: u.name,
          role: u.role,
          createdAt: u.created_at,
          followersCount,
          publicCollectionsCount,
          isFollowing
        };
      });

    const publicCollections = (inMemoryCollections || [])
      .filter(c => c.isPublic)
      .map(c => {
        const owner = inMemoryUsers.find(u => u.id === c.userId);
        return {
          id: c.id,
          userId: c.userId,
          ownerName: owner ? owner.name : 'CineVault Curator',
          name: c.name,
          description: c.description,
          createdAt: c.createdAt,
          updatedAt: c.updatedAt,
          movieCount: c.movieIds.length,
          movies: c.movieIds.slice(0, 4).map(mId => {
            const m = fallbackMovies.find(mov => mov.id === mId);
            return m ? { id: m.id, title: m.title, poster_url: m.poster_url, release_year: m.release_year } : null;
          }).filter(Boolean)
        };
      });

    return res.status(200).json({
      success: true,
      data: {
        members: filteredUsers,
        collections: publicCollections
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports.inMemoryFollows = inMemoryFollows;
