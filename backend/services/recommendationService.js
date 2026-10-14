const { pool, testConnection } = require('../config/db');
const { fallbackMovies, fallbackGenres } = require('../controllers/movieController');
const { inMemoryRatings } = require('../controllers/ratingController');
const { inMemoryHistory } = require('../controllers/watchHistoryController');

/**
 * RATING WEIGHT MAPPING:
 * - 5 stars -> +3.0 weight
 * - 4 stars -> +2.0 weight
 * - 3 stars -> +1.0 weight
 * - 2 stars -> -1.0 weight
 * - 1 star  -> -2.0 weight
 * - Watched without rating -> +1.2 baseline weight
 */
const getRatingWeight = (rating) => {
  if (rating === null || rating === undefined) return 1.2;
  const num = Number(rating);
  if (num >= 4.5) return 3.0;
  if (num >= 3.5) return 2.0;
  if (num >= 2.5) return 1.0;
  if (num >= 1.5) return -1.0;
  return -2.0;
};

/**
 * Fetch all user movie interaction data (watched movies and rated movies)
 */
async function getUserActivityData(userId) {
  const dbCheck = await testConnection();

  if (dbCheck.connected) {
    // 1. Watched movies with movie details and genres
    const [watchedRows] = await pool.query(
      `SELECT wh.movie_id, wh.watched_at, m.title, m.release_year, m.language, m.runtime,
              GROUP_CONCAT(DISTINCT g.name) AS genre_list
       FROM watch_history wh
       JOIN movies m ON wh.movie_id = m.id
       LEFT JOIN movie_genres mg ON m.id = mg.movie_id
       LEFT JOIN genres g ON mg.genre_id = g.id
       WHERE wh.user_id = ?
       GROUP BY wh.movie_id, wh.watched_at, m.title, m.release_year, m.language, m.runtime`,
      [userId]
    );

    // 2. User ratings
    const [ratedRows] = await pool.query(
      `SELECT r.movie_id, r.rating, r.created_at, m.title, m.release_year, m.language, m.runtime,
              GROUP_CONCAT(DISTINCT g.name) AS genre_list
       FROM ratings r
       JOIN movies m ON r.movie_id = m.id
       LEFT JOIN movie_genres mg ON m.id = mg.movie_id
       LEFT JOIN genres g ON mg.genre_id = g.id
       WHERE r.user_id = ?
       GROUP BY r.movie_id, r.rating, r.created_at, m.title, m.release_year, m.language, m.runtime`,
      [userId]
    );

    // Merge watched and rated by movie_id
    const movieMap = new Map();

    for (const w of watchedRows) {
      movieMap.set(w.movie_id, {
        movieId: w.movie_id,
        title: w.title,
        releaseYear: w.release_year,
        language: w.language,
        runtime: w.runtime,
        genres: w.genre_list ? w.genre_list.split(',').filter(Boolean) : [],
        watched: true,
        rating: null
      });
    }

    for (const r of ratedRows) {
      if (movieMap.has(r.movie_id)) {
        movieMap.get(r.movie_id).rating = Number(r.rating);
      } else {
        movieMap.set(r.movie_id, {
          movieId: r.movie_id,
          title: r.title,
          releaseYear: r.release_year,
          language: r.language,
          runtime: r.runtime,
          genres: r.genre_list ? r.genre_list.split(',').filter(Boolean) : [],
          watched: false,
          rating: Number(r.rating)
        });
      }
    }

    return Array.from(movieMap.values());
  }

  // Fallback in-memory activity
  const userHistory = (inMemoryHistory || []).filter(h => h.userId === userId);
  const userRatings = (inMemoryRatings || []).filter(r => r.userId === userId);

  const movieMap = new Map();

  for (const h of userHistory) {
    const movie = fallbackMovies.find(m => m.id === h.movieId);
    if (movie) {
      movieMap.set(movie.id, {
        movieId: movie.id,
        title: movie.title,
        releaseYear: movie.release_year,
        language: movie.language,
        runtime: movie.runtime,
        genres: movie.genres || [],
        watched: true,
        rating: null
      });
    }
  }

  for (const r of userRatings) {
    const movie = fallbackMovies.find(m => m.id === r.movieId);
    if (movie) {
      if (movieMap.has(movie.id)) {
        movieMap.get(movie.id).rating = r.rating;
      } else {
        movieMap.set(movie.id, {
          movieId: movie.id,
          title: movie.title,
          releaseYear: movie.release_year,
          language: movie.language,
          runtime: movie.runtime,
          genres: movie.genres || [],
          watched: false,
          rating: r.rating
        });
      }
    }
  }

  return Array.from(movieMap.values());
}

/**
 * Calculate Movie DNA for a user based on their actual watched/rated films
 */
async function calculateMovieDNA(userId) {
  const activities = await getUserActivityData(userId);

  if (activities.length === 0) {
    return {
      hasData: false,
      totalInteractions: 0,
      watchedCount: 0,
      ratedCount: 0,
      genreScores: [],
      topGenres: [],
      insights: {
        preferredEra: null,
        typicalRuntime: null,
        dominantLanguage: null
      },
      tasteSummary: 'No activity logged yet. Start watching and rating films to generate your Movie DNA!'
    };
  }

  const watchedCount = activities.filter(a => a.watched).length;
  const ratedCount = activities.filter(a => a.rating !== null).length;

  // Aggregate raw genre weights
  const rawGenreScores = {};
  const genreCount = {};

  activities.forEach(activity => {
    const weight = getRatingWeight(activity.rating);
    activity.genres.forEach(genre => {
      rawGenreScores[genre] = (rawGenreScores[genre] || 0) + weight;
      genreCount[genre] = (genreCount[genre] || 0) + 1;
    });
  });

  const genreNames = Object.keys(rawGenreScores);

  if (genreNames.length === 0) {
    return {
      hasData: true,
      totalInteractions: activities.length,
      watchedCount,
      ratedCount,
      genreScores: [],
      topGenres: [],
      insights: {
        preferredEra: null,
        typicalRuntime: null,
        dominantLanguage: null
      },
      tasteSummary: 'Your viewing history has been recorded, but genres are not yet linked.'
    };
  }

  // Determine min and max for clean normalization to 0 - 100
  const values = Object.values(rawGenreScores);
  const maxScore = Math.max(...values, 1);
  const minScore = Math.min(...values, 0);

  // Normalize scores between 20 and 100 (if positive) or 0-100
  const normalizedGenres = genreNames.map(genre => {
    const raw = rawGenreScores[genre];
    let score;
    if (maxScore === minScore) {
      score = raw > 0 ? 80 : 40;
    } else {
      score = Math.round(((raw - minScore) / (maxScore - minScore)) * 75 + 25);
    }
    // Clamp to 0 - 100
    score = Math.max(0, Math.min(100, score));

    return {
      genre,
      score,
      rawScore: Number(raw.toFixed(1)),
      count: genreCount[genre]
    };
  });

  normalizedGenres.sort((a, b) => b.score - a.score || b.count - a.count);

  // Additional taste insights (only when sufficient activity exists)
  const eraCounts = {};
  const langCounts = {};
  let totalRuntime = 0;
  let runtimeCount = 0;

  activities.forEach(a => {
    if (a.releaseYear) {
      const era = Math.floor(a.releaseYear / 10) * 10;
      const eraLabel = `${era}s`;
      eraCounts[eraLabel] = (eraCounts[eraLabel] || 0) + 1;
    }
    if (a.language) {
      langCounts[a.language] = (langCounts[a.language] || 0) + 1;
    }
    if (a.runtime && a.runtime > 0) {
      totalRuntime += a.runtime;
      runtimeCount++;
    }
  });

  let preferredEra = null;
  const sortedEras = Object.entries(eraCounts).sort((a, b) => b[1] - a[1]);
  if (sortedEras.length > 0 && activities.length >= 2) {
    preferredEra = sortedEras[0][0];
  }

  let dominantLanguage = null;
  const sortedLangs = Object.entries(langCounts).sort((a, b) => b[1] - a[1]);
  if (sortedLangs.length > 0 && activities.length >= 2) {
    dominantLanguage = sortedLangs[0][0];
  }

  let typicalRuntime = null;
  if (runtimeCount >= 2) {
    const avgRuntime = Math.round(totalRuntime / runtimeCount);
    const h = Math.floor(avgRuntime / 60);
    const m = avgRuntime % 60;
    typicalRuntime = h > 0 ? `${h}h ${m}m (${avgRuntime} mins)` : `${avgRuntime} mins`;
  }

  // Summary generation based on top 2 genres
  const top2 = normalizedGenres.slice(0, 2).map(g => g.genre);
  let tasteSummary = '';
  if (top2.length === 2) {
    tasteSummary = `Your cinematic taste is strongly inclined toward ${top2[0]} and ${top2[1]} films, shaped by the titles you've watched and rated highest.`;
  } else if (top2.length === 1) {
    tasteSummary = `Your cinematic profile is heavily anchored around ${top2[0]} stories.`;
  } else {
    tasteSummary = 'Personalized cinematic taste profile based on your recorded activity.';
  }

  return {
    hasData: true,
    totalInteractions: activities.length,
    watchedCount,
    ratedCount,
    genreScores: normalizedGenres,
    topGenres: normalizedGenres.slice(0, 5),
    insights: {
      preferredEra,
      typicalRuntime,
      dominantLanguage
    },
    tasteSummary
  };
}

/**
 * Score an unvisited movie against user's preferences
 * Formula:
 * - Genre Match (primary): +40 per matching genre multiplied by normalized genre score ratio (up to ~75 pts)
 * - Language Match: +10 pts if matches dominant language
 * - Era Match: +10 pts if within preferred decade
 * - High baseline movie quality (avg_rating): up to +15 pts
 */
function calculateRecommendationScore(userPreferences, movie) {
  let score = 0;
  const reasons = [];

  const genreScoreMap = {};
  (userPreferences.genreScores || []).forEach(g => {
    genreScoreMap[g.genre] = g.score;
  });

  const matchingTopGenres = [];
  let highestMatchingGenreScore = 0;

  (movie.genres || []).forEach(g => {
    if (genreScoreMap[g]) {
      const gScore = genreScoreMap[g];
      matchingTopGenres.push(g);
      score += Math.round((gScore / 100) * 35);
      if (gScore > highestMatchingGenreScore) {
        highestMatchingGenreScore = gScore;
      }
    }
  });

  if (matchingTopGenres.length > 0) {
    if (matchingTopGenres.length === 1) {
      reasons.push(`Matches your passion for ${matchingTopGenres[0]}`);
    } else {
      reasons.push(`Combines your favourite genres: ${matchingTopGenres.slice(0, 2).join(' & ')}`);
    }
  }

  // Language affinity
  if (userPreferences.insights?.dominantLanguage && movie.language === userPreferences.insights.dominantLanguage) {
    score += 10;
    reasons.push(`In your most-watched language (${movie.language})`);
  }

  // Era affinity
  if (userPreferences.insights?.preferredEra && movie.release_year) {
    const movieEra = `${Math.floor(movie.release_year / 10) * 10}s`;
    if (movieEra === userPreferences.insights.preferredEra) {
      score += 8;
      reasons.push(`Fits your preferred ${movieEra} release era`);
    }
  }

  // Rating quality boost
  const avgRating = Number(movie.avg_rating || 8.0);
  if (avgRating >= 8.5) {
    score += 15;
    if (reasons.length < 2) {
      reasons.push('Critically acclaimed masterpiece');
    }
  } else if (avgRating >= 8.0) {
    score += 10;
  }

  // Normalize final score between 40 and 99
  const finalScore = Math.min(99, Math.max(40, score));

  // Default explanation if empty
  const reason = reasons.length > 0 ? reasons[0] : 'Curated selection matching your cinematic taste';

  return {
    score: finalScore,
    reason,
    allReasons: reasons
  };
}

/**
 * Generate personalized recommendations or sensible fallback for the user
 */
async function getRecommendationsForUser(userId, limit = 10) {
  const dna = await calculateMovieDNA(userId);
  const activities = await getUserActivityData(userId);
  const watchedMovieIds = new Set(activities.filter(a => a.watched).map(a => a.movieId));
  const poorRatedMovieIds = new Set(activities.filter(a => a.rating !== null && a.rating <= 2.0).map(a => a.movieId));

  const dbCheck = await testConnection();
  let candidateMovies = [];

  if (dbCheck.connected) {
    const [rows] = await pool.query(`
      SELECT m.id, m.title, m.description, m.release_year, m.language, m.runtime,
             m.poster_url, m.backdrop_url,
             d.name AS director_name,
             COALESCE(AVG(r.rating), 8.5) AS avg_rating,
             COUNT(r.id) AS ratings_count,
             GROUP_CONCAT(DISTINCT g.name) AS genre_list
      FROM movies m
      LEFT JOIN directors d ON m.director_id = d.id
      LEFT JOIN movie_genres mg ON m.id = mg.movie_id
      LEFT JOIN genres g ON mg.genre_id = g.id
      LEFT JOIN ratings r ON m.id = r.movie_id
      GROUP BY m.id, d.name
      ORDER BY avg_rating DESC
    `);

    candidateMovies = rows.map(m => ({
      ...m,
      avg_rating: parseFloat(parseFloat(m.avg_rating).toFixed(1)),
      genres: m.genre_list ? m.genre_list.split(',').filter(Boolean) : []
    }));
  } else {
    candidateMovies = fallbackMovies;
  }

  // Exclude watched films and poorly rated films
  const eligibleMovies = candidateMovies.filter(
    m => !watchedMovieIds.has(m.id) && !poorRatedMovieIds.has(m.id)
  );

  // If user has insufficient activity (no DNA), provide quality fallback
  if (!dna.hasData || dna.genreScores.length === 0) {
    const fallbackList = eligibleMovies.slice(0, limit).map(m => ({
      ...m,
      recommendationScore: 85,
      recommendationReason: 'Popular & critically acclaimed on CineVault',
      isPersonalized: false
    }));

    return {
      isPersonalized: false,
      message: 'Explore our highest rated cinema as you build your personal taste profile.',
      recommendations: fallbackList,
      dna
    };
  }

  // Calculate scores for each eligible film
  const scoredMovies = eligibleMovies.map(movie => {
    const { score, reason, allReasons } = calculateRecommendationScore(dna, movie);
    return {
      ...movie,
      recommendationScore: score,
      recommendationReason: reason,
      recommendationReasons: allReasons,
      isPersonalized: true
    };
  });

  // Sort descending by recommendation score
  scoredMovies.sort((a, b) => b.recommendationScore - a.recommendationScore || b.avg_rating - a.avg_rating);

  const topRecommendations = scoredMovies.slice(0, limit);

  return {
    isPersonalized: true,
    recommendations: topRecommendations,
    dna
  };
}

module.exports = {
  calculateMovieDNA,
  calculateRecommendationScore,
  getRecommendationsForUser
};
