const { pool, testConnection } = require('../config/db');

// In-memory fallback sample dataset for local resilience when MySQL is offline
const fallbackMovies = [
  {
    id: 1,
    title: 'Inception',
    description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
    release_year: 2010,
    language: 'English',
    runtime: 148,
    poster_url: 'https://image.tmdb.org/t/p/w500/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg',
    backdrop_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200',
    director_name: 'Christopher Nolan',
    genres: ['Action', 'Sci-Fi', 'Thriller'],
    actors: ['Leonardo DiCaprio', 'Elliot Page'],
    avg_rating: 9.2,
    ratings_count: 1540
  },
  {
    id: 2,
    title: 'The Dark Knight',
    description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
    release_year: 2008,
    language: 'English',
    runtime: 152,
    poster_url: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    backdrop_url: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=1200',
    director_name: 'Christopher Nolan',
    genres: ['Action', 'Drama', 'Crime'],
    actors: ['Cillian Murphy', 'Christian Bale'],
    avg_rating: 9.5,
    ratings_count: 2800
  },
  {
    id: 3,
    title: 'Pulp Fiction',
    description: 'The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.',
    release_year: 1994,
    language: 'English',
    runtime: 154,
    poster_url: 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
    backdrop_url: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1200',
    director_name: 'Quentin Tarantino',
    genres: ['Drama', 'Crime'],
    actors: ['Brad Pitt', 'John Travolta'],
    avg_rating: 8.9,
    ratings_count: 1950
  },
  {
    id: 4,
    title: 'Parasite',
    description: 'Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.',
    release_year: 2019,
    language: 'Korean',
    runtime: 132,
    poster_url: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
    backdrop_url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200',
    director_name: 'Bong Joon-ho',
    genres: ['Drama', 'Thriller'],
    actors: ['Song Kang-ho'],
    avg_rating: 8.6,
    ratings_count: 1320
  },
  {
    id: 5,
    title: 'Spirited Away',
    description: 'During her family\'s move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches, and spirits, where humans are changed into beasts.',
    release_year: 2001,
    language: 'Japanese',
    runtime: 125,
    poster_url: 'https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg',
    backdrop_url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1200',
    director_name: 'Hayao Miyazaki',
    genres: ['Animation', 'Adventure'],
    actors: ['Rumi Hiiragi'],
    avg_rating: 8.7,
    ratings_count: 1100
  },
  {
    id: 6,
    title: 'Dune',
    description: 'A noble family becomes embroiled in a war for control over the galaxy\'s most valuable asset while its heir becomes troubled by visions of a dark future.',
    release_year: 2021,
    language: 'English',
    runtime: 155,
    poster_url: 'https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg',
    backdrop_url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1200',
    director_name: 'Denis Villeneuve',
    genres: ['Sci-Fi', 'Adventure'],
    actors: ['Timothée Chalamet', 'Zendaya'],
    avg_rating: 8.4,
    ratings_count: 1650
  },
  {
    id: 7,
    title: 'Oppenheimer',
    description: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.',
    release_year: 2023,
    language: 'English',
    runtime: 180,
    poster_url: 'https://image.tmdb.org/t/p/w500/ptpr0kGAckfQkJeJIt8st5dglvd.jpg',
    backdrop_url: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1200',
    director_name: 'Christopher Nolan',
    genres: ['Drama'],
    actors: ['Cillian Murphy'],
    avg_rating: 8.9,
    ratings_count: 2100
  },
  {
    id: 8,
    title: 'Interstellar',
    description: 'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft, along with a team of researchers, to find a new planet for humans.',
    release_year: 2014,
    language: 'English',
    runtime: 169,
    poster_url: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    backdrop_url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1200',
    director_name: 'Christopher Nolan',
    genres: ['Sci-Fi', 'Drama', 'Adventure'],
    actors: ['Leonardo DiCaprio', 'Matthew McConaughey'],
    avg_rating: 8.8,
    ratings_count: 2400
  },
  {
    id: 9,
    title: 'Killers of the Flower Moon',
    description: 'When oil is discovered in 1920s Oklahoma under Osage Nation land, the Osage people are murdered one by one until the FBI steps in to unravel the conspiracy.',
    release_year: 2023,
    language: 'English',
    runtime: 206,
    poster_url: 'https://image.tmdb.org/t/p/w500/dB6Krk806zeqd0YNp2ngQ9zXteH.jpg',
    backdrop_url: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1200',
    director_name: 'Martin Scorsese',
    genres: ['Drama', 'Crime'],
    actors: ['Leonardo DiCaprio', 'Robert De Niro'],
    avg_rating: 8.1,
    ratings_count: 980
  },
  {
    id: 10,
    title: 'Barbie',
    description: 'Barbie and Ken are having the time of their lives in the colorful and seemingly perfect world of Barbie Land. However, when they get a chance to go to the real world, they soon discover the joys and perils of living among humans.',
    release_year: 2023,
    language: 'English',
    runtime: 114,
    poster_url: 'https://image.tmdb.org/t/p/w500/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg',
    backdrop_url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200',
    director_name: 'Greta Gerwig',
    genres: ['Comedy', 'Adventure'],
    actors: ['Margot Robbie', 'Ryan Gosling'],
    avg_rating: 7.8,
    ratings_count: 1450
  }
];

const fallbackGenres = [
  { id: 1, name: 'Action' },
  { id: 2, name: 'Sci-Fi' },
  { id: 3, name: 'Drama' },
  { id: 4, name: 'Thriller' },
  { id: 5, name: 'Animation' },
  { id: 6, name: 'Crime' },
  { id: 7, name: 'Adventure' },
  { id: 8, name: 'Comedy' }
];

exports.fallbackMovies = fallbackMovies;
exports.fallbackGenres = fallbackGenres;

/**
 * GET /api/movies
 * List movies with search, filter (genre, language, year), sorting, and pagination
 */
exports.getMovies = async (req, res, next) => {
  try {
    const {
      search,
      genre,
      language,
      year,
      sort = 'latest',
      page = 1,
      limit = 12
    } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 12;
    const offset = (pageNum - 1) * limitNum;

    const dbCheck = await testConnection();

    if (dbCheck.connected) {
      // Dynamic SQL Construction
      let whereClauses = [];
      let queryParams = [];

      if (search && search.trim() !== '') {
        whereClauses.push('(m.title LIKE ? OR m.description LIKE ?)');
        const searchPattern = `%${search.trim()}%`;
        queryParams.push(searchPattern, searchPattern);
      }

      if (language && language.trim() !== '') {
        whereClauses.push('m.language = ?');
        queryParams.push(language.trim());
      }

      if (year && !isNaN(parseInt(year, 10))) {
        whereClauses.push('m.release_year = ?');
        queryParams.push(parseInt(year, 10));
      }

      if (genre && genre.trim() !== '') {
        whereClauses.push('m.id IN (SELECT mg.movie_id FROM movie_genres mg JOIN genres g ON mg.genre_id = g.id WHERE g.name = ? OR g.id = ?)');
        queryParams.push(genre.trim(), genre.trim());
      }

      const whereSQL = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

      // Sorting
      let orderBySQL = 'ORDER BY m.release_year DESC';
      switch (sort) {
        case 'oldest':
          orderBySQL = 'ORDER BY m.release_year ASC';
          break;
        case 'title_asc':
          orderBySQL = 'ORDER BY m.title ASC';
          break;
        case 'title_desc':
          orderBySQL = 'ORDER BY m.title DESC';
          break;
        case 'runtime_asc':
          orderBySQL = 'ORDER BY m.runtime ASC';
          break;
        case 'runtime_desc':
          orderBySQL = 'ORDER BY m.runtime DESC';
          break;
        case 'rating':
          orderBySQL = 'ORDER BY avg_rating DESC';
          break;
        case 'latest':
        default:
          orderBySQL = 'ORDER BY m.release_year DESC, m.id DESC';
          break;
      }

      // Count Query
      const countQuery = `
        SELECT COUNT(DISTINCT m.id) AS total
        FROM movies m
        ${whereSQL}
      `;
      const [countResult] = await pool.query(countQuery, queryParams);
      const totalItems = countResult[0].total;

      // Data Query with aggregate genres and ratings
      const dataQuery = `
        SELECT 
          m.id,
          m.title,
          m.description,
          m.release_year,
          m.language,
          m.runtime,
          m.poster_url,
          m.backdrop_url,
          d.name AS director_name,
          COALESCE(AVG(r.rating), 8.5) AS avg_rating,
          COUNT(r.id) AS ratings_count,
          GROUP_CONCAT(DISTINCT g.name) AS genre_list
        FROM movies m
        LEFT JOIN directors d ON m.director_id = d.id
        LEFT JOIN movie_genres mg ON m.id = mg.movie_id
        LEFT JOIN genres g ON mg.genre_id = g.id
        LEFT JOIN ratings r ON m.id = r.movie_id
        ${whereSQL}
        GROUP BY m.id, d.name
        ${orderBySQL}
        LIMIT ? OFFSET ?
      `;

      const [rows] = await pool.query(dataQuery, [...queryParams, limitNum, offset]);

      const formattedMovies = rows.map(movie => ({
        ...movie,
        avg_rating: parseFloat(parseFloat(movie.avg_rating).toFixed(1)),
        genres: movie.genre_list ? movie.genre_list.split(',') : []
      }));

      return res.status(200).json({
        success: true,
        data: formattedMovies,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(totalItems / limitNum) || 1,
          totalItems,
          limit: limitNum
        }
      });
    }

    // Fallback mode filtering & sorting
    let filtered = [...fallbackMovies];

    if (search && search.trim() !== '') {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(m => m.title.toLowerCase().includes(q) || m.description.toLowerCase().includes(q));
    }

    if (genre && genre.trim() !== '') {
      const g = genre.toLowerCase().trim();
      filtered = filtered.filter(m => m.genres.some(gen => gen.toLowerCase() === g));
    }

    if (language && language.trim() !== '') {
      filtered = filtered.filter(m => m.language.toLowerCase() === language.toLowerCase().trim());
    }

    if (year && !isNaN(parseInt(year, 10))) {
      filtered = filtered.filter(m => m.release_year === parseInt(year, 10));
    }

    // Sort fallback
    if (sort === 'oldest') filtered.sort((a, b) => a.release_year - b.release_year);
    else if (sort === 'title_asc') filtered.sort((a, b) => a.title.localeCompare(b.title));
    else if (sort === 'title_desc') filtered.sort((a, b) => b.title.localeCompare(a.title));
    else if (sort === 'rating') filtered.sort((a, b) => b.avg_rating - a.avg_rating);
    else if (sort === 'runtime_asc') filtered.sort((a, b) => a.runtime - b.runtime);
    else if (sort === 'runtime_desc') filtered.sort((a, b) => b.runtime - a.runtime);
    else filtered.sort((a, b) => b.release_year - a.release_year);

    const totalItems = filtered.length;
    const paginated = filtered.slice(offset, offset + limitNum);

    return res.status(200).json({
      success: true,
      data: paginated,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalItems / limitNum) || 1,
        totalItems,
        limit: limitNum
      }
    });

  } catch (error) {
    console.error('getMovies Error:', error);
    next(error);
  }
};

/**
 * GET /api/movies/:id
 * Get single movie details with genres, director, and actors
 */
exports.getMovieById = async (req, res, next) => {
  try {
    const movieId = parseInt(req.params.id, 10);

    if (isNaN(movieId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid movie ID parameter.'
      });
    }

    const dbCheck = await testConnection();

    if (dbCheck.connected) {
      // Query single movie details
      const movieQuery = `
        SELECT 
          m.id,
          m.title,
          m.description,
          m.release_year,
          m.language,
          m.runtime,
          m.poster_url,
          m.backdrop_url,
          d.name AS director_name,
          COALESCE(AVG(r.rating), 8.5) AS avg_rating,
          COUNT(r.id) AS ratings_count
        FROM movies m
        LEFT JOIN directors d ON m.director_id = d.id
        LEFT JOIN ratings r ON m.id = r.movie_id
        WHERE m.id = ?
        GROUP BY m.id, d.name
      `;

      const [movieRows] = await pool.query(movieQuery, [movieId]);

      if (movieRows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Movie not found.'
        });
      }

      const movie = movieRows[0];

      // Query Genres
      const [genreRows] = await pool.query(
        'SELECT g.id, g.name FROM genres g JOIN movie_genres mg ON g.id = mg.genre_id WHERE mg.movie_id = ?',
        [movieId]
      );

      // Query Actors
      const [actorRows] = await pool.query(
        'SELECT a.id, a.name FROM actors a JOIN movie_actors ma ON a.id = ma.actor_id WHERE ma.movie_id = ?',
        [movieId]
      );

      return res.status(200).json({
        success: true,
        data: {
          ...movie,
          avg_rating: parseFloat(parseFloat(movie.avg_rating).toFixed(1)),
          genres: genreRows.map(g => g.name),
          actors: actorRows.map(a => a.name)
        }
      });
    }

    // Fallback mode for single movie
    const found = fallbackMovies.find(m => m.id === movieId);
    if (!found) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found.'
      });
    }

    return res.status(200).json({
      success: true,
      data: found
    });

  } catch (error) {
    console.error('getMovieById Error:', error);
    next(error);
  }
};

/**
 * GET /api/genres
 * Get all available genres
 */
exports.getGenres = async (req, res, next) => {
  try {
    const dbCheck = await testConnection();
    if (dbCheck.connected) {
      const [genres] = await pool.query('SELECT id, name FROM genres ORDER BY name ASC');
      return res.status(200).json({
        success: true,
        data: genres
      });
    }
    return res.status(200).json({
      success: true,
      data: fallbackGenres
    });
  } catch (error) {
    console.error('getGenres Error:', error);
    next(error);
  }
};

/**
 * GET /api/languages
 * Get distinct movie languages
 */
exports.getLanguages = async (req, res, next) => {
  try {
    const dbCheck = await testConnection();
    if (dbCheck.connected) {
      const [langs] = await pool.query('SELECT DISTINCT language FROM movies WHERE language IS NOT NULL ORDER BY language ASC');
      return res.status(200).json({
        success: true,
        data: langs.map(l => l.language)
      });
    }
    return res.status(200).json({
      success: true,
      data: ['English', 'Korean', 'Japanese']
    });
  } catch (error) {
    console.error('getLanguages Error:', error);
    next(error);
  }
};
