import React, { useState, useEffect } from 'react';
import { fetchWatchHistory, removeFromWatchHistory } from '../services/api';
import ProtectedRoute from '../components/ProtectedRoute';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  } catch {
    return '';
  }
};

const WatchHistoryPageContent = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [removingId, setRemovingId] = useState(null);

  const loadHistory = async () => {
    setLoading(true);
    setError('');
    const res = await fetchWatchHistory();
    if (res.success) {
      setMovies(res.data);
    } else {
      setError(res.message || 'Failed to load your viewing history.');
    }
    setLoading(false);
  };

  useEffect(() => { loadHistory(); }, []);

  const handleRemove = async (movieId) => {
    setRemovingId(movieId);
    const res = await removeFromWatchHistory(movieId);
    if (res.success) {
      setMovies(prev => prev.filter(m => m.id !== movieId));
    }
    setRemovingId(null);
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar currentPath="#/history" />
      <main className="flex-grow-1 py-5">
        <div className="container">
          <div className="mb-5">
            <h2 className="fw-bold text-white mb-1">
              <i className="bi bi-clock-history text-purple-gradient me-2"></i>Viewing History
            </h2>
            <p className="text-secondary mb-0">Every film you've marked as watched</p>
          </div>

          {loading && <LoadingSpinner message="Loading your viewing history..." />}
          {!loading && error && (
            <div className="glass-card p-4 text-center">
              <i className="bi bi-exclamation-triangle text-warning fs-2 mb-3 d-block"></i>
              <p className="text-secondary mb-3">{error}</p>
              <button className="btn btn-cv-outline" onClick={loadHistory}>Try Again</button>
            </div>
          )}
          {!loading && !error && movies.length === 0 && (
            <EmptyState
              icon="bi-eye"
              title="You haven't watched anything yet"
              subtitle="Start exploring CineVault and build your personal viewing history. Mark films as watched to track your cinema journey."
              actionLabel="Explore Films"
              actionHref="#/discover"
            />
          )}
          {!loading && !error && movies.length > 0 && (
            <>
              <p className="text-secondary small mb-4">{movies.length} film{movies.length > 1 ? 's' : ''} watched</p>
              <div className="row g-3 g-md-4">
                {movies.map(movie => {
                  const genres = Array.isArray(movie.genres)
                    ? movie.genres
                    : typeof movie.genre_list === 'string'
                    ? movie.genre_list.split(',')
                    : [];

                  return (
                    <div key={movie.id} className="col-12 col-md-6">
                      <div className="glass-card p-0 overflow-hidden d-flex" style={{ height: '140px' }}>
                        {/* Poster Thumbnail */}
                        <div style={{ width: '100px', flexShrink: 0 }}>
                          <img
                            src={movie.poster_url || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600'}
                            alt={movie.title}
                            className="w-100 h-100"
                            style={{ objectFit: 'cover', cursor: 'pointer' }}
                            onClick={() => { window.location.hash = `#/movies/${movie.id}`; }}
                            onError={e => { e.target.src = 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=600'; }}
                          />
                        </div>
                        {/* Info */}
                        <div className="p-3 d-flex flex-column justify-content-between flex-grow-1 overflow-hidden">
                          <div>
                            <h6
                              className="fw-bold text-white mb-1 text-truncate"
                              style={{ cursor: 'pointer' }}
                              onClick={() => { window.location.hash = `#/movies/${movie.id}`; }}
                            >
                              {movie.title}
                            </h6>
                            <div className="d-flex flex-wrap align-items-center gap-2 text-secondary small mb-1">
                              <span>{movie.release_year}</span>
                              {genres[0] && (
                                <span className="badge px-2 py-1" style={{ background: 'rgba(138,43,226,0.25)', color: '#c084fc', fontSize: '0.7rem', borderRadius: '5px' }}>
                                  {genres[0]}
                                </span>
                              )}
                            </div>
                            {movie.watched_at && (
                              <div className="d-flex align-items-center gap-1 text-secondary" style={{ fontSize: '0.75rem' }}>
                                <i className="bi bi-eye-fill" style={{ color: '#22c55e', fontSize: '0.7rem' }}></i>
                                <span>Watched {formatDate(movie.watched_at)}</span>
                              </div>
                            )}
                          </div>
                          <button
                            className="btn btn-sm btn-outline-danger align-self-start d-flex align-items-center gap-1 mt-1"
                            style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}
                            onClick={() => handleRemove(movie.id)}
                            disabled={removingId === movie.id}
                          >
                            {removingId === movie.id
                              ? <span className="spinner-border spinner-border-sm" />
                              : <><i className="bi bi-x-lg"></i> Remove</>
                            }
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

const WatchHistoryPage = () => (
  <ProtectedRoute>
    <WatchHistoryPageContent />
  </ProtectedRoute>
);

export default WatchHistoryPage;
