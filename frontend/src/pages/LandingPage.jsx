import React, { useState, useEffect } from 'react';
import { fetchMovies, fetchGenres, fetchRecommendations } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MovieGrid from '../components/MovieGrid';
import LoadingSpinner from '../components/LoadingSpinner';

const LandingPage = () => {
  const { isAuthenticated, user } = useAuth();
  const [featuredMovies, setFeaturedMovies] = useState([]);
  const [recommendedMovies, setRecommendedMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const promises = [
        fetchMovies({ sort: 'rating', limit: 8 }),
        fetchGenres()
      ];

      if (isAuthenticated) {
        promises.push(fetchRecommendations({ limit: 4 }));
      }

      const results = await Promise.all(promises);
      const moviesRes = results[0];
      const genresRes = results[1];
      const recRes = isAuthenticated ? results[2] : null;

      if (moviesRes.success) setFeaturedMovies(moviesRes.data);
      if (genresRes.success) setGenres(genresRes.data);
      if (recRes && recRes.success && recRes.data) setRecommendedMovies(recRes.data);
      setLoading(false);
    };
    loadData();
  }, [isAuthenticated]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      window.location.hash = `#/discover?search=${encodeURIComponent(searchInput.trim())}`;
    } else {
      window.location.hash = '#/discover';
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar currentPath="#/" />

      <main className="flex-grow-1">
        {/* HERO SECTION */}
        <section className="py-5">
          <div className="container py-4 text-center">
            <h1 className="display-4 fw-bold text-white mb-3" style={{ letterSpacing: '-0.025em' }}>
              Your Cinema. <span style={{ color: 'var(--cv-purple-light)' }}>Your Story.</span>
            </h1>

            <p className="text-secondary mb-4 mx-auto" style={{ maxWidth: '580px', fontSize: '1.05rem', lineHeight: '1.6' }}>
              Discover cinema matched to your taste, explore community collections, and decode your personal Movie DNA.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="d-flex align-items-stretch gap-2 mx-auto mb-4" style={{ maxWidth: '540px' }}>
              <div className="input-group">
                <span className="input-group-text bg-dark border-secondary border-opacity-50 text-secondary">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search films, directors, genres..."
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                />
                <button type="submit" className="btn btn-cv-primary px-4 fw-medium">
                  Search
                </button>
              </div>
            </form>

            {/* Navigation links */}
            <div className="d-flex align-items-center justify-content-center gap-2 flex-wrap">
              {isAuthenticated ? (
                <>
                  <a href="#/recommendations" className="btn btn-cv-primary">
                    Recommended For You
                  </a>
                  <a href="#/dna" className="btn btn-cv-outline">
                    Movie DNA
                  </a>
                  <a href="#/discover" className="btn btn-cv-outline">
                    Browse Films
                  </a>
                </>
              ) : (
                <>
                  <a href="#/register" className="btn btn-cv-primary">
                    Get Started
                  </a>
                  <a href="#/discover" className="btn btn-cv-outline">
                    Browse Films
                  </a>
                  <a href="#/community" className="btn btn-cv-outline">
                    Explore Community
                  </a>
                </>
              )}
            </div>
          </div>
        </section>

        {/* RECOMMENDED FOR YOU (FOR LOGGED-IN USERS) */}
        {isAuthenticated && recommendedMovies.length > 0 && (
          <section className="py-4" style={{ borderTop: '1px solid var(--cv-border-subtle)' }}>
            <div className="container">
              <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
                <div>
                  <h4 className="fw-semibold text-white mb-1">Recommended For You</h4>
                  <p className="text-secondary small mb-0">Films tailored to your taste profile and viewing history</p>
                </div>
                <a href="#/recommendations" className="text-purple-light text-decoration-none small fw-medium d-flex align-items-center gap-1">
                  View all <i className="bi bi-arrow-right"></i>
                </a>
              </div>

              <div className="row g-3 g-md-4">
                {recommendedMovies.map(movie => (
                  <div key={movie.id} className="col-6 col-md-3">
                    <div
                      className="glass-card cv-card-interactive h-100 d-flex flex-column overflow-hidden"
                      onClick={() => { window.location.hash = `#/movies/${movie.id}`; }}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="position-relative" style={{ paddingTop: '140%', backgroundColor: '#0f0c1b' }}>
                        <img
                          src={movie.poster_url || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600'}
                          alt={movie.title}
                          className="position-absolute top-0 start-0 w-100 h-100 object-fit-cover"
                        />
                        <div
                          className="position-absolute top-0 end-0 m-2 px-2 py-0 rounded-1 small fw-medium text-white"
                          style={{
                            background: 'rgba(13, 11, 20, 0.85)',
                            backdropFilter: 'blur(4px)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            fontSize: '0.72rem'
                          }}
                        >
                          {movie.recommendationScore}% match
                        </div>
                      </div>
                      <div className="p-3 d-flex flex-column flex-grow-1 justify-content-between">
                        <div>
                          <h6 className="fw-semibold text-white mb-1 text-truncate" title={movie.title} style={{ fontSize: '0.925rem' }}>
                            {movie.title}
                          </h6>
                          <div className="d-flex align-items-center justify-content-between small text-secondary mb-2" style={{ fontSize: '0.8rem' }}>
                            <span>{movie.release_year}</span>
                            <span className="text-warning">★ {movie.avg_rating}</span>
                          </div>
                        </div>
                        <div
                          className="p-1 px-2 rounded small text-secondary text-truncate"
                          style={{ fontSize: '0.72rem', background: 'rgba(255, 255, 255, 0.04)' }}
                        >
                          {movie.recommendationReason}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* TOP RATED FILMS */}
        <section className="py-4" style={{ borderTop: '1px solid var(--cv-border-subtle)' }}>
          <div className="container">
            <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
              <div>
                <h4 className="fw-semibold text-white mb-1">Top Rated Films</h4>
                <p className="text-secondary small mb-0">Critically acclaimed cinema from around the world</p>
              </div>
              <a href="#/discover?sort=rating" className="text-purple-light text-decoration-none small fw-medium d-flex align-items-center gap-1">
                View all <i className="bi bi-arrow-right"></i>
              </a>
            </div>

            {loading
              ? <LoadingSpinner message="Loading films..." />
              : <MovieGrid
                  movies={featuredMovies}
                  onSelect={movie => { window.location.hash = `#/movies/${movie.id}`; }}
                />
            }
          </div>
        </section>

        {/* BROWSE BY GENRE */}
        {genres.length > 0 && (
          <section className="py-4" style={{ borderTop: '1px solid var(--cv-border-subtle)' }}>
            <div className="container">
              <div className="mb-3">
                <h4 className="fw-semibold text-white mb-1">Browse by Genre</h4>
                <p className="text-secondary small mb-0">Explore cinema by categories and moods</p>
              </div>
              <div className="row g-2 g-md-3">
                {genres.map(genre => (
                  <div key={genre.id || genre.name} className="col-6 col-sm-4 col-md-3">
                    <a
                      href={`#/discover`}
                      className="glass-card cv-card-interactive d-flex align-items-center p-3 text-decoration-none"
                      onClick={() => { localStorage.setItem('cv_genre_filter', genre.name); }}
                    >
                      <span className="fw-medium text-white small">{genre.name || genre}</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* PLATFORM FEATURES */}
        {!isAuthenticated && (
          <section className="py-5" style={{ borderTop: '1px solid var(--cv-border-subtle)' }}>
            <div className="container">
              <div className="text-center mb-5">
                <h4 className="fw-semibold text-white mb-2">Designed for Film Lovers</h4>
                <p className="text-secondary small mx-auto" style={{ maxWidth: '480px' }}>
                  A focused space to track, organize, and discover cinema without distractions.
                </p>
              </div>
              <div className="row g-4">
                {[
                  { title: 'Taste Profile & DNA', desc: 'Calculates your authentic cinema affinity based on your personal ratings and viewing patterns.' },
                  { title: 'Transparent Recommendations', desc: 'Explainable suggestions that clearly detail why a film fits your viewing habits.' },
                  { title: 'Curated Collections', desc: 'Create private or public shelves, organize films by theme, and share them with the community.' },
                ].map((feature, i) => (
                  <div key={i} className="col-md-4">
                    <div className="glass-card p-4 h-100">
                      <h6 className="fw-semibold text-white mb-2">{feature.title}</h6>
                      <p className="text-secondary small mb-0" style={{ lineHeight: '1.6' }}>{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center mt-5">
                <a href="#/register" className="btn btn-cv-primary px-4">
                  Create an Account
                </a>
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default LandingPage;
