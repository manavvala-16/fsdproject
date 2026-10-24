import React, { useState, useEffect } from 'react';
import {
  fetchMovieById,
  addToWatchlist, removeFromWatchlist, fetchWatchlist,
  addToWatchHistory, removeFromWatchHistory, fetchWatchHistory
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';

const formatRuntime = (minutes) => {
  if (!minutes) return 'N/A';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

const MovieDetailsPage = ({ movieId }) => {
  const { isAuthenticated } = useAuth();

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [inWatchlist, setInWatchlist] = useState(false);
  const [isWatched, setIsWatched] = useState(false);
  const [wlLoading, setWlLoading] = useState(false);
  const [whLoading, setWhLoading] = useState(false);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      const res = await fetchMovieById(movieId);
      if (res.success && res.data) {
        setMovie(res.data);
      } else {
        setError(res.message || 'Movie not found.');
      }
      setLoading(false);
    };
    load();
  }, [movieId]);

  // Load user status
  useEffect(() => {
    if (!isAuthenticated || !movieId) return;
    const loadUserStatus = async () => {
      const [wlRes, histRes] = await Promise.all([fetchWatchlist(), fetchWatchHistory()]);
      if (wlRes.success) setInWatchlist(wlRes.data.some(m => m.id === parseInt(movieId)));
      if (histRes.success) setIsWatched(histRes.data.some(m => m.id === parseInt(movieId)));
    };
    loadUserStatus();
  }, [isAuthenticated, movieId]);

  const showFeedback = (msg) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(''), 3000);
  };

  const handleWatchlistToggle = async () => {
    if (!isAuthenticated) { window.location.hash = '#/login'; return; }
    setWlLoading(true);
    if (inWatchlist) {
      const res = await removeFromWatchlist(movieId);
      if (res.success) { setInWatchlist(false); showFeedback('Removed from watchlist.'); }
    } else {
      const res = await addToWatchlist(movieId);
      if (res.success) { setInWatchlist(true); showFeedback('Added to your watchlist!'); }
    }
    setWlLoading(false);
  };

  const handleWatchedToggle = async () => {
    if (!isAuthenticated) { window.location.hash = '#/login'; return; }
    setWhLoading(true);
    if (isWatched) {
      const res = await removeFromWatchHistory(movieId);
      if (res.success) { setIsWatched(false); showFeedback('Removed from viewing history.'); }
    } else {
      const res = await addToWatchHistory(movieId);
      if (res.success) { setIsWatched(true); showFeedback('Marked as watched!'); }
    }
    setWhLoading(false);
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <main className="flex-grow-1">
        {loading && (
          <div className="py-5"><LoadingSpinner message="Loading movie details..." /></div>
        )}

        {!loading && error && (
          <div className="container py-5 text-center">
            <div className="glass-card p-5 mx-auto" style={{ maxWidth: '500px' }}>
              <i className="bi bi-film text-secondary display-3 mb-3 d-block"></i>
              <h4 className="text-white mb-2">Movie Not Found</h4>
              <p className="text-secondary mb-4">{error}</p>
              <a href="#/discover" className="btn btn-cv-primary">Browse Films</a>
            </div>
          </div>
        )}

        {!loading && !error && movie && (
          <>
            {/* Backdrop Hero */}
            <div className="position-relative" style={{ height: '380px', overflow: 'hidden', backgroundColor: '#0d0b14' }}>
              <img
                src={movie.backdrop_url || movie.poster_url || 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=1200'}
                alt={movie.title}
                className="w-100 h-100 object-fit-cover"
                style={{ opacity: 0.28 }}
                onError={e => { e.target.src = 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1200'; }}
              />
              <div
                className="position-absolute bottom-0 start-0 w-100 py-4 px-3 px-md-4"
                style={{ background: 'linear-gradient(to top, #0d0b14 0%, transparent 100%)' }}
              >
                <div className="container">
                  <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                    {movie.genres?.map(g => (
                      <span key={g} className="badge bg-purple-subtle text-purple-light small">{g}</span>
                    ))}
                  </div>
                  <h1 className="display-6 fw-bold text-white mb-2">{movie.title}</h1>
                  <div className="d-flex flex-wrap align-items-center gap-3 text-secondary small">
                    <span>{movie.release_year}</span>
                    <span>•</span>
                    <span>{formatRuntime(movie.runtime)}</span>
                    <span>•</span>
                    <span>{movie.language}</span>
                    {movie.avg_rating && (
                      <>
                        <span>•</span>
                        <span className="d-flex align-items-center gap-1">
                          <i className="bi bi-star-fill" style={{ color: 'var(--cv-gold)' }}></i>
                          <span className="text-white fw-medium">{parseFloat(movie.avg_rating).toFixed(1)}</span>
                          <span className="text-secondary">/ 10</span>
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Back Button */}
              <button
                className="btn btn-cv-outline position-absolute top-0 start-0 m-3 d-flex align-items-center gap-2 py-1 px-3 small"
                onClick={() => window.history.back()}
              >
                <i className="bi bi-arrow-left"></i> Back
              </button>
            </div>

            {/* Content Section */}
            <div className="container py-4">
              {/* Feedback toast */}
              {feedback && (
                <div className="alert alert-success border-success-subtle bg-success-subtle text-success d-flex align-items-center gap-2 py-2 px-3 rounded-2 small mb-4">
                  <i className="bi bi-check-circle"></i> {feedback}
                </div>
              )}

              <div className="row g-4 g-lg-5">
                {/* Left: Poster & Actions */}
                <div className="col-md-4 col-lg-3">
                  <img
                    src={movie.poster_url || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600'}
                    alt={movie.title}
                    className="w-100 rounded-2"
                    style={{ objectFit: 'cover', border: '1px solid var(--cv-border-subtle)', aspectRatio: '2/3' }}
                    onError={e => { e.target.src = 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=600'; }}
                  />

                  {/* Action Buttons */}
                  <div className="d-flex flex-column gap-2 mt-3">
                    {isAuthenticated ? (
                      <>
                        <button
                          className={`btn w-100 d-flex align-items-center justify-content-center gap-2 ${inWatchlist ? 'btn-cv-primary' : 'btn-cv-outline'}`}
                          onClick={handleWatchlistToggle}
                          disabled={wlLoading}
                        >
                          {wlLoading
                            ? <span className="spinner-border spinner-border-sm" />
                            : <i className={`bi ${inWatchlist ? 'bi-bookmark-check-fill' : 'bi-bookmark'}`}></i>
                          }
                          <span>{inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}</span>
                        </button>
                        <button
                          className={`btn w-100 d-flex align-items-center justify-content-center gap-2 ${isWatched ? 'btn-success' : 'btn-cv-outline'}`}
                          onClick={handleWatchedToggle}
                          disabled={whLoading}
                        >
                          {whLoading
                            ? <span className="spinner-border spinner-border-sm" />
                            : <i className={`bi ${isWatched ? 'bi-check-lg' : 'bi-eye'}`}></i>
                          }
                          <span>{isWatched ? 'Watched' : 'Mark as Watched'}</span>
                        </button>
                      </>
                    ) : (
                      <a href="#/login" className="btn btn-cv-outline w-100 d-flex align-items-center justify-content-center gap-2">
                        Sign in to save
                      </a>
                    )}
                  </div>
                </div>

                {/* Right: Details */}
                <div className="col-md-8 col-lg-9">
                  <h4 className="fw-semibold text-white mb-2">{movie.title}</h4>
                  <p className="text-secondary mb-4" style={{ lineHeight: '1.7', maxWidth: '720px' }}>
                    {movie.description}
                  </p>

                  <div className="row g-3 mb-4">
                    {movie.director_name && (
                      <div className="col-sm-6">
                        <div className="glass-card p-3">
                          <p className="text-secondary small mb-1">Director</p>
                          <p className="text-white fw-medium mb-0">{movie.director_name}</p>
                        </div>
                      </div>
                    )}
                    <div className="col-sm-6">
                      <div className="glass-card p-3">
                        <p className="text-secondary small mb-1">Release Year</p>
                        <p className="text-white fw-medium mb-0">{movie.release_year || 'Unknown'}</p>
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="glass-card p-3">
                        <p className="text-secondary small mb-1">Runtime</p>
                        <p className="text-white fw-medium mb-0">{formatRuntime(movie.runtime)}</p>
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="glass-card p-3">
                        <p className="text-secondary small mb-1">Language</p>
                        <p className="text-white fw-medium mb-0">{movie.language || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Genres */}
                  {movie.genres && movie.genres.length > 0 && (
                    <div className="mb-4">
                      <p className="text-secondary small mb-2">Genres</p>
                      <div className="d-flex flex-wrap gap-2">
                        {movie.genres.map(g => (
                          <span
                            key={g}
                            className="badge bg-purple-subtle text-purple-light px-3 py-2"
                          >
                            {g}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Cast */}
                  {movie.actors && movie.actors.length > 0 && (
                    <div className="mb-4">
                      <p className="text-secondary small mb-2">Cast</p>
                      <div className="d-flex flex-wrap gap-2">
                        {movie.actors.map(a => (
                          <span
                            key={a}
                            className="badge px-3 py-2 text-secondary"
                            style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--cv-border-subtle)', fontWeight: 400 }}
                          >
                            {a}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default MovieDetailsPage;
