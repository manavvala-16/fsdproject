import React from 'react';
import { useAuth } from '../context/AuthContext';

const HeroSection = () => {
  const { isAuthenticated, user } = useAuth();

  // Sample curated films showcase for cinematic atmosphere
  const featuredFilms = [
    { title: 'Inception', year: 2010, director: 'Christopher Nolan', genre: 'Sci-Fi / Thriller', rating: '8.8', poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600' },
    { title: 'The Dark Knight', year: 2008, director: 'Christopher Nolan', genre: 'Action / Crime', rating: '9.0', poster: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600' },
    { title: 'Parasite', year: 2019, director: 'Bong Joon-ho', genre: 'Drama / Thriller', rating: '8.5', poster: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=600' },
    { title: 'Dune', year: 2021, director: 'Denis Villeneuve', genre: 'Sci-Fi / Adventure', rating: '8.0', poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600' },
  ];

  return (
    <section className="py-5 position-relative">
      <div className="container py-3">
        {/* Main Hero Header */}
        <div className="row align-items-center justify-content-center text-center mb-5">
          <div className="col-lg-10 col-xl-9">
            <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill mb-4" style={{ background: 'rgba(138, 43, 226, 0.15)', border: '1px solid rgba(138, 43, 226, 0.4)' }}>
              <i className="bi bi-stars text-purple-gradient"></i>
              <span className="small fw-semibold text-purple-light">Personalized Cinema Discovery & Curation</span>
            </div>

            <h1 className="display-2 fw-extrabold text-white mb-3" style={{ letterSpacing: '-0.03em' }}>
              Cine<span className="text-purple-gradient">Vault</span>
            </h1>

            <p className="display-6 tagline-serif mb-4" style={{ color: '#e2e8f0', fontSize: '2rem' }}>
              "Your Cinema. Your Story."
            </p>

            <p className="lead text-secondary mb-4 mx-auto" style={{ maxWidth: '720px', fontSize: '1.15rem' }}>
              Curate your personal watchlists, log viewing history, rate masterpieces, write reviews, and build shared film collections in a beautifully immersive cinematic environment.
            </p>

            <div className="d-flex align-items-center justify-content-center gap-3 flex-wrap">
              {isAuthenticated ? (
                <>
                  <a href="#/discover" className="btn btn-cv-primary d-inline-flex align-items-center gap-2 btn-lg fs-6">
                    <i className="bi bi-compass"></i> Explore Movies
                  </a>
                  <a href="#/profile" className="btn btn-cv-outline d-inline-flex align-items-center gap-2 btn-lg fs-6">
                    <i className="bi bi-person-badge"></i> Hello, {user?.name}
                  </a>
                </>
              ) : (
                <>
                  <a href="#/register" className="btn btn-cv-primary d-inline-flex align-items-center gap-2 btn-lg fs-6">
                    <i className="bi bi-play-circle-fill"></i> Create Free Account
                  </a>
                  <a href="#/login" className="btn btn-cv-outline d-inline-flex align-items-center gap-2 btn-lg fs-6">
                    <i className="bi bi-box-arrow-in-right"></i> Member Sign In
                  </a>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Featured Masterpieces Carousel / Cards */}
        <div className="mt-5">
          <div className="d-flex align-items-center justify-content-between mb-4 border-bottom border-secondary border-opacity-25 pb-3">
            <div>
              <h4 className="fw-bold mb-1 text-white">Featured Masterpieces</h4>
              <p className="text-secondary small mb-0">Critically acclaimed films trending on CineVault</p>
            </div>
            <a href="#/discover" className="text-purple-light text-decoration-none small fw-semibold hover-underline">
              Browse All <i className="bi bi-arrow-right ms-1"></i>
            </a>
          </div>

          <div className="row g-4">
            {featuredFilms.map((film, index) => (
              <div key={index} className="col-6 col-md-3">
                <div className="glass-card h-100 overflow-hidden position-relative group">
                  <div className="position-relative" style={{ height: '320px', overflow: 'hidden' }}>
                    <img 
                      src={film.poster} 
                      alt={film.title} 
                      className="w-100 h-100 object-fit-cover transition-transform duration-300"
                      style={{ transition: 'transform 0.4s ease' }}
                    />
                    <div className="position-absolute top-0 end-0 m-2 badge bg-dark bg-opacity-75 text-warning border border-warning-subtle d-flex align-items-center gap-1 px-2 py-1">
                      <i className="bi bi-star-fill"></i> {film.rating}
                    </div>
                  </div>
                  <div className="p-3">
                    <span className="badge bg-purple-subtle text-purple-light border border-purple-subtle mb-2" style={{ fontSize: '0.7rem' }}>
                      {film.genre}
                    </span>
                    <h6 className="fw-bold text-white mb-1 text-truncate">{film.title}</h6>
                    <div className="d-flex align-items-center justify-content-between text-secondary small">
                      <span>{film.director}</span>
                      <span>{film.year}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Platform Feature Highlights */}
        <div className="row g-4 mt-5">
          <div className="col-md-4">
            <div className="glass-card p-4 h-100">
              <div className="d-inline-flex p-3 rounded-3 mb-3" style={{ background: 'rgba(138, 43, 226, 0.2)', color: '#a855f7' }}>
                <i className="bi bi-bookmark-heart fs-3"></i>
              </div>
              <h5 className="fw-bold text-white mb-2">Personal Watchlists</h5>
              <p className="text-secondary small mb-0">
                Organize every film you plan to watch. Keep track of cinema across genres, directors, and release eras seamlessly.
              </p>
            </div>
          </div>

          <div className="col-md-4">
            <div className="glass-card p-4 h-100">
              <div className="d-inline-flex p-3 rounded-3 mb-3" style={{ background: 'rgba(251, 191, 36, 0.2)', color: '#fbbf24' }}>
                <i className="bi bi-star-half fs-3"></i>
              </div>
              <h5 className="fw-bold text-white mb-2">Ratings & Reviews</h5>
              <p className="text-secondary small mb-0">
                Rate films on a 10-point scale, log viewing history timestamps, and write detailed reviews to share your cinematic perspectives.
              </p>
            </div>
          </div>

          <div className="col-md-4">
            <div className="glass-card p-4 h-100">
              <div className="d-inline-flex p-3 rounded-3 mb-3" style={{ background: 'rgba(96, 165, 250, 0.2)', color: '#60a5fa' }}>
                <i className="bi bi-collection-play fs-3"></i>
              </div>
              <h5 className="fw-bold text-white mb-2">Custom Collections</h5>
              <p className="text-secondary small mb-0">
                Craft themed playlists like "Mind-Bending Sci-Fi" or "Noir Classics" to curate and share your personal movie vault.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
