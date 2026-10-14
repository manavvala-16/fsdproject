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
        {/* ── HERO SECTION ── */}
        <section className="py-5 position-relative" style={{ paddingTop: '80px !important' }}>
          <div className="container py-4 text-center">
            <div
              className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill mb-4"
              style={{ background: 'rgba(138, 43, 226, 0.15)', border: '1px solid rgba(138, 43, 226, 0.4)' }}
            >
              <i className="bi bi-stars text-purple-gradient"></i>
              <span className="small fw-semibold text-purple-light">Personalized Cinema Discovery & Curation</span>
            </div>

            <h1 className="display-3 fw-bold text-white mb-3" style={{ letterSpacing: '-0.025em' }}>
              Your Cinema.<br className="d-block d-md-none" /> <span className="text-purple-gradient">Your Story.</span>
            </h1>

            <p className="lead text-secondary mb-5 mx-auto" style={{ maxWidth: '640px', fontSize: '1.15rem' }}>
              Discover films that match your taste, explore community collections, decode your Movie DNA, and find your next favourite.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="d-flex align-items-stretch gap-2 mx-auto mb-5" style={{ maxWidth: '580px' }}>
              <div className="input-group input-group-lg shadow-lg">
                <span className="input-group-text bg-dark border-secondary border-opacity-50 text-secondary">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control bg-dark text-light border-secondary border-opacity-50"
                  placeholder="Search films, directors, genres..."
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                />
                <button type="submit" className="btn btn-cv-primary px-4 fw-semibold">
                  Search
                </button>
              </div>
            </form>

            {/* CTA Buttons */}
            <div className="d-flex align-items-center justify-content-center gap-3 flex-wrap">
              {isAuthenticated ? (
                <>
                  <a href="#/recommendations" className="btn btn-cv-primary btn-lg d-inline-flex align-items-center gap-2">
                    <i className="bi bi-stars"></i> Recommended For You
                  </a>
                  <a href="#/dna" className="btn btn-cv-outline btn-lg d-inline-flex align-items-center gap-2">
                    <i className="bi bi-fingerprint"></i> Your Movie DNA
                  </a>
                  <a href="#/community" className="btn btn-cv-outline btn-lg d-inline-flex align-items-center gap-2">
                    <i className="bi bi-people"></i> Community
                  </a>
                </>
              ) : (
                <>
                  <a href="#/register" className="btn btn-cv-primary btn-lg d-inline-flex align-items-center gap-2">
                    <i className="bi bi-person-plus-fill"></i> Get Started Free
                  </a>
                  <a href="#/discover" className="btn btn-cv-outline btn-lg d-inline-flex align-items-center gap-2">
                    <i className="bi bi-compass"></i> Browse Films
                  </a>
                  <a href="#/community" className="btn btn-cv-outline btn-lg d-inline-flex align-items-center gap-2">
                    <i className="bi bi-people"></i> Community
                  </a>
                </>
              )}
            </div>
          </div>
        </section>

        {/* ── RECOMMENDED FOR YOU (FOR LOGGED-IN USERS) ── */}
        {isAuthenticated && recommendedMovies.length > 0 && (
          <section className="py-5" style={{ background: 'rgba(138, 43, 226, 0.05)' }}>
            <div className="container">
              <div className="d-flex align-items-center justify-content-between mb-4 border-bottom border-secondary border-opacity-25 pb-3 flex-wrap gap-2">
                <div>
                  <h3 className="fw-bold text-white mb-1">
                    <i className="bi bi-stars text-purple-light me-2"></i>Recommended For You
                  </h3>
                  <p className="text-secondary small mb-0">Personalized selections tailored to your Movie DNA</p>
                </div>
                <a href="#/recommendations" className="text-purple-light text-decoration-none small fw-semibold d-flex align-items-center gap-1">
                  View All Recommendations <i className="bi bi-arrow-right"></i>
                </a>
              </div>

              <div className="row g-3 g-md-4">
                {recommendedMovies.map(movie => (
                  <div key={movie.id} className="col-6 col-md-3">
                    <div
                      className="glass-card h-100 d-flex flex-column overflow-hidden hover-scale cursor-pointer"
                      onClick={() => { window.location.hash = `#/movies/${movie.id}`; }}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="position-relative" style={{ paddingTop: '140%' }}>
                        <img
                          src={movie.poster_url || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600'}
                          alt={movie.title}
                          className="position-absolute top-0 start-0 w-100 h-100"
                          style={{ objectFit: 'cover' }}
                        />
                        <div
                          className="position-absolute top-0 end-0 m-2 px-2 py-0 rounded-pill small fw-bold text-white shadow"
                          style={{
                            background: 'rgba(11, 9, 20, 0.85)',
                            backdropFilter: 'blur(8px)',
                            border: '1px solid rgba(168, 85, 247, 0.4)',
                            fontSize: '0.7rem'
                          }}
                        >
                          <i className="bi bi-stars text-warning me-1"></i>
                          {movie.recommendationScore}%
                        </div>
                      </div>
                      <div className="p-3 d-flex flex-column flex-grow-1 justify-content-between">
                        <div>
                          <h6 className="fw-bold text-white mb-1 text-truncate" title={movie.title}>
                            {movie.title}
                          </h6>
                          <div className="d-flex align-items-center justify-content-between small text-secondary mb-2">
                            <span>{movie.release_year}</span>
                            <span className="text-warning fw-semibold">★ {movie.avg_rating}</span>
                          </div>
                        </div>
                        <div
                          className="p-1 rounded small text-purple-light text-truncate"
                          style={{ fontSize: '0.72rem', background: 'rgba(168, 85, 247, 0.1)' }}
                        >
                          <i className="bi bi-lightbulb-fill text-warning me-1"></i>
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

        {/* ── TOP RATED FILMS ── */}
        <section className="py-5">
          <div className="container">
            <div className="d-flex align-items-center justify-content-between mb-4 border-bottom border-secondary border-opacity-25 pb-3">
              <div>
                <h3 className="fw-bold text-white mb-1">
                  <i className="bi bi-trophy text-warning me-2"></i>Top Rated Films
                </h3>
                <p className="text-secondary small mb-0">Critically acclaimed cinema from around the world</p>
              </div>
              <a href="#/discover?sort=rating" className="text-purple-light text-decoration-none small fw-semibold d-flex align-items-center gap-1">
                View All <i className="bi bi-arrow-right"></i>
              </a>
            </div>

            {loading
              ? <LoadingSpinner message="Loading top films..." />
              : <MovieGrid
                  movies={featuredMovies}
                  onSelect={movie => { window.location.hash = `#/movies/${movie.id}`; }}
                />
            }
          </div>
        </section>

        {/* ── BROWSE BY GENRE ── */}
        {genres.length > 0 && (
          <section className="py-5" style={{ background: 'rgba(0,0,0,0.2)' }}>
            <div className="container">
              <div className="mb-4">
                <h3 className="fw-bold text-white mb-1">
                  <i className="bi bi-grid-3x3-gap text-purple-light me-2"></i>Browse by Genre
                </h3>
                <p className="text-secondary small mb-0">Find films in your favourite category</p>
              </div>
              <div className="row g-3">
                {genres.map(genre => {
                  const genreIcons = {
                    'Action': 'bi-lightning-fill', 'Sci-Fi': 'bi-rocket-fill',
                    'Drama': 'bi-masks-theater', 'Thriller': 'bi-eye-fill',
                    'Animation': 'bi-star-fill', 'Crime': 'bi-shield-fill',
                    'Adventure': 'bi-compass-fill', 'Comedy': 'bi-emoji-laughing-fill',
                  };
                  const icon = genreIcons[genre.name] || 'bi-film';
                  return (
                    <div key={genre.id || genre.name} className="col-6 col-md-3">
                      <a
                        href={`#/discover`}
                        className="glass-card d-flex align-items-center gap-3 p-3 text-decoration-none"
                        onClick={() => { localStorage.setItem('cv_genre_filter', genre.name); }}
                        style={{ transition: 'all 0.25s ease' }}
                        onMouseEnter={e => {
                          e.currentTarget.style.transform = 'translateY(-3px)';
                          e.currentTarget.style.borderColor = 'rgba(168,85,247,0.5)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.transform = '';
                          e.currentTarget.style.borderColor = '';
                        }}
                      >
                        <div
                          className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0"
                          style={{ width: '42px', height: '42px', background: 'rgba(138,43,226,0.2)' }}
                        >
                          <i className={`bi ${icon} text-purple-light`}></i>
                        </div>
                        <span className="fw-semibold text-white">{genre.name || genre}</span>
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ── PLATFORM FEATURES ── */}
        {!isAuthenticated && (
          <section className="py-5">
            <div className="container">
              <div className="text-center mb-5">
                <h3 className="fw-bold text-white mb-2">Everything You Need for Your Cinema Journey</h3>
                <p className="text-secondary">Join CineVault and take control of your movie experience</p>
              </div>
              <div className="row g-4">
                {[
                  { icon: 'bi-fingerprint', color: 'rgba(138,43,226,0.2)', iconColor: '#a855f7', title: 'Movie DNA', desc: 'Uncover your authentic cinema identity calculated from your viewing patterns and ratings.' },
                  { icon: 'bi-stars', color: 'rgba(59,130,246,0.2)', iconColor: '#60a5fa', title: 'Personalized Discovery', desc: 'Get explainable movie recommendations that show you exactly why each film fits your taste.' },
                  { icon: 'bi-people-fill', color: 'rgba(251,191,36,0.2)', iconColor: '#fbbf24', title: 'Vibrant Community', desc: 'Follow curators, explore shared public collections, and connect over great film.' },
                ].map((feature, i) => (
                  <div key={i} className="col-md-4">
                    <div className="glass-card p-4 h-100 text-center">
                      <div
                        className="d-inline-flex align-items-center justify-content-center rounded-3 mb-3 p-3"
                        style={{ background: feature.color }}
                      >
                        <i className={`bi ${feature.icon} fs-2`} style={{ color: feature.iconColor }}></i>
                      </div>
                      <h5 className="fw-bold text-white mb-2">{feature.title}</h5>
                      <p className="text-secondary small mb-0">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center mt-5">
                <a href="#/register" className="btn btn-cv-primary btn-lg px-5">
                  <i className="bi bi-person-plus-fill me-2"></i>Create Free Account
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
