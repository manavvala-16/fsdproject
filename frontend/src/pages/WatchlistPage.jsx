import React, { useState, useEffect } from 'react';
import { fetchWatchlist, removeFromWatchlist } from '../services/api';
import ProtectedRoute from '../components/ProtectedRoute';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MovieGrid from '../components/MovieGrid';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const WatchlistPageContent = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [removingId, setRemovingId] = useState(null);

  const loadWatchlist = async () => {
    setLoading(true);
    setError('');
    const res = await fetchWatchlist();
    if (res.success) {
      setMovies(res.data);
    } else {
      setError(res.message || 'Failed to load your watchlist.');
    }
    setLoading(false);
  };

  useEffect(() => { loadWatchlist(); }, []);

  const handleRemove = async (movie) => {
    setRemovingId(movie.id);
    const res = await removeFromWatchlist(movie.id);
    if (res.success) {
      setMovies(prev => prev.filter(m => m.id !== movie.id));
    }
    setRemovingId(null);
  };

  const getActionSlot = (movie) => (
    <button
      className="btn btn-sm btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2 fw-semibold"
      onClick={e => { e.stopPropagation(); handleRemove(movie); }}
      disabled={removingId === movie.id}
      style={{ fontSize: '0.8rem' }}
    >
      {removingId === movie.id
        ? <span className="spinner-border spinner-border-sm" />
        : <><i className="bi bi-bookmark-x"></i> Remove</>
      }
    </button>
  );

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar currentPath="#/watchlist" />
      <main className="flex-grow-1 py-5">
        <div className="container">
          <div className="mb-5">
            <h2 className="fw-bold text-white mb-1">
              <i className="bi bi-bookmark-heart text-purple-gradient me-2"></i>My Watchlist
            </h2>
            <p className="text-secondary mb-0">Films you've saved for later viewing</p>
          </div>

          {loading && <LoadingSpinner message="Loading your watchlist..." />}
          {!loading && error && (
            <div className="glass-card p-4 text-center">
              <i className="bi bi-exclamation-triangle text-warning fs-2 mb-3 d-block"></i>
              <p className="text-secondary mb-3">{error}</p>
              <button className="btn btn-cv-outline" onClick={loadWatchlist}>Try Again</button>
            </div>
          )}
          {!loading && !error && movies.length === 0 && (
            <EmptyState
              icon="bi-bookmark"
              title="Your watchlist is empty"
              subtitle="Discover something worth watching and save it here. Build your personal cinema queue."
              actionLabel="Browse Films"
              actionHref="#/discover"
            />
          )}
          {!loading && !error && movies.length > 0 && (
            <>
              <p className="text-secondary small mb-4">{movies.length} film{movies.length > 1 ? 's' : ''} saved</p>
              <MovieGrid
                movies={movies}
                onSelect={movie => { window.location.hash = `#/movies/${movie.id}`; }}
                getActionSlot={getActionSlot}
              />
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

const WatchlistPage = () => (
  <ProtectedRoute>
    <WatchlistPageContent />
  </ProtectedRoute>
);

export default WatchlistPage;
