-- ============================================================
-- CineVault Database Schema
-- Database Name: cinevault
-- ============================================================

CREATE DATABASE IF NOT EXISTS cinevault;
USE cinevault;

-- Drop existing tables if re-initializing (in reverse dependency order)
DROP TABLE IF EXISTS followers;
DROP TABLE IF EXISTS collection_movies;
DROP TABLE IF EXISTS collections;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS ratings;
DROP TABLE IF EXISTS watch_history;
DROP TABLE IF EXISTS watchlists;
DROP TABLE IF EXISTS movie_actors;
DROP TABLE IF EXISTS movie_genres;
DROP TABLE IF EXISTS movies;
DROP TABLE IF EXISTS actors;
DROP TABLE IF EXISTS directors;
DROP TABLE IF EXISTS genres;
DROP TABLE IF EXISTS users;

-- 1. Users Table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Directors Table
CREATE TABLE directors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Actors Table
CREATE TABLE actors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Genres Table
CREATE TABLE genres (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Movies Table
CREATE TABLE movies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    release_year INT,
    language VARCHAR(50) DEFAULT 'English',
    runtime INT COMMENT 'Runtime in minutes',
    poster_url VARCHAR(500),
    backdrop_url VARCHAR(500),
    director_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (director_id) REFERENCES directors(id) ON DELETE SET NULL,
    INDEX idx_movies_title (title),
    INDEX idx_movies_release_year (release_year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Movie-Genres (Many-to-Many)
CREATE TABLE movie_genres (
    movie_id INT NOT NULL,
    genre_id INT NOT NULL,
    PRIMARY KEY (movie_id, genre_id),
    FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
    FOREIGN KEY (genre_id) REFERENCES genres(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Movie-Actors (Many-to-Many)
CREATE TABLE movie_actors (
    movie_id INT NOT NULL,
    actor_id INT NOT NULL,
    PRIMARY KEY (movie_id, actor_id),
    FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
    FOREIGN KEY (actor_id) REFERENCES actors(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Watchlists Table
CREATE TABLE watchlists (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    movie_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, movie_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Watch History Table
CREATE TABLE watch_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    movie_id INT NOT NULL,
    watched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Ratings Table (One rating per user per movie)
CREATE TABLE ratings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    movie_id INT NOT NULL,
    rating DECIMAL(3,1) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE (user_id, movie_id),
    CONSTRAINT chk_rating_range CHECK (rating >= 0.0 AND rating <= 10.0),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Reviews Table
CREATE TABLE reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    movie_id INT NOT NULL,
    review_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. Collections Table
CREATE TABLE collections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. Collection Movies Table (Prevent duplicate movies per collection)
CREATE TABLE collection_movies (
    collection_id INT NOT NULL,
    movie_id INT NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (collection_id, movie_id),
    FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE,
    FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. Followers Table (Prevent self-follow & duplicate follow)
CREATE TABLE followers (
    follower_id INT NOT NULL,
    following_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (follower_id, following_id),
    CONSTRAINT chk_no_self_follow CHECK (follower_id <> following_id),
    FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- SEED SAMPLE DATA
-- ============================================================

-- Directors
INSERT INTO directors (id, name) VALUES
(1, 'Christopher Nolan'),
(2, 'Quentin Tarantino'),
(3, 'Bong Joon-ho'),
(4, 'Hayao Miyazaki'),
(5, 'Denis Villeneuve'),
(6, 'Martin Scorsese'),
(7, 'Greta Gerwig');

-- Actors
INSERT INTO actors (id, name) VALUES
(1, 'Leonardo DiCaprio'),
(2, 'Cillian Murphy'),
(3, 'Christian Bale'),
(4, 'Timothée Chalamet'),
(5, 'Song Kang-ho'),
(6, 'Elliot Page'),
(7, 'Brad Pitt'),
(8, 'Zendaya'),
(9, 'Margot Robbie'),
(10, 'Robert De Niro');

-- Genres
INSERT INTO genres (id, name) VALUES
(1, 'Action'),
(2, 'Sci-Fi'),
(3, 'Drama'),
(4, 'Thriller'),
(5, 'Animation'),
(6, 'Crime'),
(7, 'Adventure'),
(8, 'Comedy');

-- Movies (10 Populated Movies)
INSERT INTO movies (id, title, description, release_year, language, runtime, poster_url, backdrop_url, director_id) VALUES
(1, 'Inception', 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.', 2010, 'English', 148, 'https://image.tmdb.org/t/p/w500/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg', 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200', 1),
(2, 'The Dark Knight', 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.', 2008, 'English', 152, 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg', 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=1200', 1),
(3, 'Pulp Fiction', 'The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.', 1994, 'English', 154, 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg', 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1200', 2),
(4, 'Parasite', 'Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.', 2019, 'Korean', 132, 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg', 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200', 3),
(5, 'Spirited Away', 'During her family''s move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches, and spirits, where humans are changed into beasts.', 2001, 'Japanese', 125, 'https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg', 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1200', 4),
(6, 'Dune', 'A noble family becomes embroiled in a war for control over the galaxy''s most valuable asset while its heir becomes troubled by visions of a dark future.', 2021, 'English', 155, 'https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg', 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1200', 5),
(7, 'Oppenheimer', 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.', 2023, 'English', 180, 'https://image.tmdb.org/t/p/w500/ptpr0kGAckfQkJeJIt8st5dglvd.jpg', 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1200', 1),
(8, 'Interstellar', 'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft, along with a team of researchers, to find a new planet for humans.', 2014, 'English', 169, 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1200', 1),
(9, 'Killers of the Flower Moon', 'When oil is discovered in 1920s Oklahoma under Osage Nation land, the Osage people are murdered one by one until the FBI steps in to unravel the conspiracy.', 2023, 'English', 206, 'https://image.tmdb.org/t/p/w500/dB6Krk806zeqd0YNp2ngQ9zXteH.jpg', 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1200', 6),
(10, 'Barbie', 'Barbie and Ken are having the time of their lives in the colorful and seemingly perfect world of Barbie Land. However, when they get a chance to go to the real world, they soon discover the joys and perils of living among humans.', 2023, 'English', 114, 'https://image.tmdb.org/t/p/w500/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg', 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200', 7);

-- Movie-Genres Junction
INSERT INTO movie_genres (movie_id, genre_id) VALUES
(1, 1), (1, 2), (1, 4), -- Inception: Action, Sci-Fi, Thriller
(2, 1), (2, 3), (2, 6), -- The Dark Knight: Action, Drama, Crime
(3, 3), (3, 6),         -- Pulp Fiction: Drama, Crime
(4, 3), (4, 4),         -- Parasite: Drama, Thriller
(5, 5), (5, 7),         -- Spirited Away: Animation, Adventure
(6, 2), (6, 7),         -- Dune: Sci-Fi, Adventure
(7, 3),                 -- Oppenheimer: Drama
(8, 2), (8, 3), (8, 7), -- Interstellar: Sci-Fi, Drama, Adventure
(9, 3), (9, 6),         -- Killers of the Flower Moon: Drama, Crime
(10, 8), (10, 7);       -- Barbie: Comedy, Adventure

-- Movie-Actors Junction
INSERT INTO movie_actors (movie_id, actor_id) VALUES
(1, 1), (1, 6), -- Inception: Leonardo DiCaprio, Elliot Page
(2, 2), (2, 3), -- Dark Knight: Cillian Murphy, Christian Bale
(3, 7),         -- Pulp Fiction: Brad Pitt
(4, 5),         -- Parasite: Song Kang-ho
(6, 4), (6, 8), -- Dune: Timothée Chalamet, Zendaya
(7, 2),         -- Oppenheimer: Cillian Murphy
(8, 1),         -- Interstellar: Leonardo DiCaprio
(9, 1), (9, 10),-- Killers of the Flower Moon: Leonardo DiCaprio, Robert De Niro
(10, 9);        -- Barbie: Margot Robbie

-- Sample Users
INSERT INTO users (id, name, email, password, role) VALUES
(1, 'Admin User', 'admin@cinevault.com', '$2a$10$7R.E2T8P0jYV1W7K5t7GyeK6P8R.E2T8P0jYV1W7K5t7GyeK6P8R.', 'admin'),
(2, 'John Doe', 'john@example.com', '$2a$10$wT0l9F/JqYxO2e4h5z3M2.7G8H9I0J1K2L3M4N5O6P7Q8R9S0T1U2', 'user');

-- Sample Watchlist
INSERT INTO watchlists (user_id, movie_id) VALUES
(2, 1),
(2, 6);

-- Sample Watch History
INSERT INTO watch_history (user_id, movie_id, watched_at) VALUES
(2, 2, CURRENT_TIMESTAMP);

-- Sample Ratings
INSERT INTO ratings (user_id, movie_id, rating) VALUES
(2, 1, 9.5),
(2, 2, 10.0),
(2, 4, 9.0),
(2, 7, 9.2),
(2, 8, 9.6);
