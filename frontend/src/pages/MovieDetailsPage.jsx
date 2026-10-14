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
            <div className="position-relative" style={{ height: '420px', overflow: 'hidden' }}>
              <img
                src={movie.backdrop_url || movie.poster_url || 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=1200'}
                alt={movie.title}
                className="w-100 h-100"
                style={{ objectFit: 'cover', filter: 'brightness(0.35)' }}
                onError={e => { e.target.src = 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1200'; }}
              />
              <div
                className="position-absolute bottom-0 start-0 w-100 py-5 px-3 px-md-5"
                style={{ background: 'linear-gradient(transparent, rgba(11,9,20,1))' }}
              >
                <div className="container">
                  <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                    {movie.genres?.map(g => (
                      <span key={g} className="badge px-2 py-1" style={{ background: 'rgba(138,43,226,0.8)', fontSize: '0.75rem' }}>{g}</span>
                    ))}
                  </div>
                  <h1 className="display-5 fw-bold text-white mb-2">{movie.title}</h1>
                  <div className="d-flex flex-wrap align-items-center gap-3 text-secondary small">
                    <span><i className="bi bi-calendar3 me-1"></i>{movie.release_year}</span>
                    <span><i className="bi bi-clock me-1"></i>{formatRuntime(movie.runtime)}</span>
                    <span><i className="bi bi-translate me-1"></i>{movie.language}</span>
                    {movie.avg_rating && (
                      <span className="d-flex align-items-center gap-1">
                        <i className="bi bi-star-fill" style={{ color: '#fbbf24' }}></i>
                        <span className="text-white fw-bold">{parseFloat(movie.avg_rating).toFixed(1)}</span>
                        <span className="text-secondary">/ 10</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Back Button */}
              <button
                className="btn btn-cv-outline position-absolute top-0 start-0 m-3 d-flex align-items-center gap-2"
                onClick={() => window.history.back()}
                style={{ backdropFilter: 'blur(8px)' }}
              >
                <i className="bi bi-arrow-left"></i> Back
              </button>
            </div>

            {/* Content Section */}
            <div className="container py-5">
              {/* Feedback toast */}
              {feedback && (
                <div className="alert alert-success border-success-subtle bg-success-subtle text-success d-flex align-items-center gap-2 py-2 px-3 rounded-3 small mb-4">
                  <i className="bi bi-check-circle-fill"></i> {feedback}
                </div>
              )}

              <div className="row g-5">
                {/* Left: Poster */}
                <div className="col-md-3">
                  <img
                    src={movie.poster_url || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600'}
                    alt={movie.title}
                    className="w-100 rounded-4 shadow-lg"
                    style={{ objectFit: 'cover', border: '2px solid rgba(138,43,226,0.3)' }}
                    onError={e => { e.target.src = 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=600'; }}
                  />

                  {/* Action Buttons */}
                  <div className="d-flex flex-column gap-2 mt-3">
                    {isAuthenticated ? (
                      <>
                        <button
                          className={`btn w-100 d-flex align-items-center justify-content-center gap-2 fw-semibold ${inWatchlist ? 'btn-cv-primary' : 'btn-cv-outline'}`}
                          onClick={handleWatchlistToggle}
                          disabled={wlLoading}
                        >
                          {wlLoading
                            ? <span className="spinner-border spinner-border-sm" />
                            : <i className={`bi ${inWatchlist ? 'bi-bookmark-fill' : 'bi-bookmark-plus'}`}></i>
                          }
                          {inWatchlist ? '✓ In Watchlist' : '+ Add to Watchlist'}
                        </button>
                        <button
                          className={`btn w-100 d-flex align-items-center justify-content-center gap-2 fw-semibold ${isWatched ? 'btn-success' : 'btn-cv-outline'}`}
                          onClick={handleWatchedToggle}
                          disabled={whLoading}
                        >
                          {whLoading
                            ? <span className="spinner-border spinner-border-sm" />
                            : <i className={`bi ${isWatched ? 'bi-eye-fill' : 'bi-eye'}`}></i>
                          }
                          {isWatched ? '✓ Watched' : 'Mark as Watched'}
                        </button>
                      </>
                    ) : (
                      <a href="#/login" className="btn btn-cv-outline w-100 d-flex align-items-center justify-content-center gap-2">
                        <i className="bi bi-person-lock"></i> Sign in to Save
                      </a>
                    )}
                  </div>
                </div>

                {/* Right: Details */}
                <div className="col-md-9">
                  <h2 className="fw-bold text-white mb-1">{movie.title}</h2>
                  <p className="text-secondary mb-4" style={{ fontSize: '1.05rem', lineHeight: '1.75' }}>
                    {movie.description}
                  </p>

                  <div className="row g-3 mb-4">
                    {movie.director_name && (
                      <div className="col-sm-6">
                        <div className="glass-card p-3">
                          <p className="text-secondary small mb-1 fw-semibold text-uppercase">Director</p>
                          <p className="text-white fw-bold mb-0">{movie.director_name}</p>
                        </div>
                      </div>
                    )}
                    <div className="col-sm-6">
                      <div className="glass-card p-3">
                        <p className="text-secondary small mb-1 fw-semibold text-uppercase">Release Year</p>
                        <p className="text-white fw-bold mb-0">{movie.release_year || 'Unknown'}</p>
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="glass-card p-3">
                        <p className="text-secondary small mb-1 fw-semibold text-uppercase">Runtime</p>
                        <p className="text-white fw-bold mb-0">{formatRuntime(movie.runtime)}</p>
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="glass-card p-3">
                        <p className="text-secondary small mb-1 fw-semibold text-uppercase">Language</p>
                        <p className="text-white fw-bold mb-0">{movie.language || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Genres */}
                  {movie.genres && movie.genres.length > 0 && (
                    <div className="mb-4">
                      <p className="text-secondary small fw-semibold text-uppercase mb-2">Genres</p>
                      <div className="d-flex flex-wrap gap-2">
                        {movie.genres.map(g => (
                          <span
                            key={g}
                            className="badge px-3 py-2"
                            style={{ background: 'rgba(138,43,226,0.25)', border: '1px solid rgba(168,85,247,0.4)', color: '#c084fc', fontSize: '0.85rem', borderRadius: '8px' }}
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
                      <p className="text-secondary small fw-semibold text-uppercase mb-2">Cast</p>
                      <div className="d-flex flex-wrap gap-2">
                        {movie.actors.map(a => (
                          <span
                            key={a}
                            className="badge px-3 py-2"
                            style={{ background: 'rgba(30,30,50,0.7)', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0', fontSize: '0.85rem', borderRadius: '8px' }}
                          >
                            <i className="bi bi-person me-1"></i>{a}
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
