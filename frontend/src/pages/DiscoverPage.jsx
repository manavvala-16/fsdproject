import React, { useState, useEffect, useCallback } from 'react';
import {
  fetchMovies, fetchGenres, fetchLanguages,
  addToWatchlist, removeFromWatchlist, fetchWatchlist,
  addToWatchHistory, fetchWatchHistory
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MovieGrid from '../components/MovieGrid';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const SORT_OPTIONS = [
  { value: 'latest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'title_asc', label: 'A → Z' },
  { value: 'title_desc', label: 'Z → A' },
  { value: 'runtime_asc', label: 'Shortest First' },
  { value: 'runtime_desc', label: 'Longest First' },
];

const DiscoverPage = () => {
  const { isAuthenticated } = useAuth();

  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // User-specific state
  const [watchlistIds, setWatchlistIds] = useState(new Set());
  const [watchedIds, setWatchedIds] = useState(new Set());
  const [actionLoading, setActionLoading] = useState({});

  // Filters
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [sort, setSort] = useState('latest');
  const [page, setPage] = useState(1);

  // Load genres and languages once
  useEffect(() => {
    const loadFilters = async () => {
      const [genresRes, langRes] = await Promise.all([fetchGenres(), fetchLanguages()]);
      if (genresRes.success) setGenres(genresRes.data);
      if (langRes.success) setLanguages(langRes.data);
    };
    loadFilters();
  }, []);

  // Load user's watchlist & history when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;
    const loadUserData = async () => {
      const [wlRes, histRes] = await Promise.all([fetchWatchlist(), fetchWatchHistory()]);
      if (wlRes.success) setWatchlistIds(new Set(wlRes.data.map(m => m.id)));
      if (histRes.success) setWatchedIds(new Set(histRes.data.map(m => m.id)));
    };
    loadUserData();
  }, [isAuthenticated]);

  // Load movies whenever filters change
  const loadMovies = useCallback(async () => {
    setLoading(true);
    setError('');
    const params = { search, genre: selectedGenre, language: selectedLanguage, year: selectedYear, sort, page, limit: 12 };
    // remove empty params
    Object.keys(params).forEach(k => !params[k] && delete params[k]);

    const res = await fetchMovies(params);
    if (res.success) {
      setMovies(res.data);
      setPagination(res.pagination);
    } else {
      setError(res.message || 'Failed to load movies.');
      setMovies([]);
    }
    setLoading(false);
  }, [search, selectedGenre, selectedLanguage, selectedYear, sort, page]);

  useEffect(() => { loadMovies(); }, [loadMovies]);

  // Search submit handler
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearch(''); setSearchInput('');
    setSelectedGenre(''); setSelectedLanguage(''); setSelectedYear('');
    setSort('latest'); setPage(1);
  };

  // Watchlist toggle
  const handleWatchlistToggle = async (movie) => {
    if (!isAuthenticated) { window.location.hash = '#/login'; return; }
    setActionLoading(prev => ({ ...prev, [`wl_${movie.id}`]: true }));
    if (watchlistIds.has(movie.id)) {
      const res = await removeFromWatchlist(movie.id);
      if (res.success) setWatchlistIds(prev => { const s = new Set(prev); s.delete(movie.id); return s; });
    } else {
      const res = await addToWatchlist(movie.id);
      if (res.success) setWatchlistIds(prev => new Set([...prev, movie.id]));
    }
    setActionLoading(prev => ({ ...prev, [`wl_${movie.id}`]: false }));
  };

  // Mark watched toggle
  const handleMarkWatched = async (movie) => {
    if (!isAuthenticated) { window.location.hash = '#/login'; return; }
    if (watchedIds.has(movie.id)) return;
    setActionLoading(prev => ({ ...prev, [`wh_${movie.id}`]: true }));
    const res = await addToWatchHistory(movie.id);
    if (res.success) setWatchedIds(prev => new Set([...prev, movie.id]));
    setActionLoading(prev => ({ ...prev, [`wh_${movie.id}`]: false }));
  };

  const getActionSlot = (movie) => (
    <div className="d-flex gap-2">
      <button
        className={`btn btn-sm flex-grow-1 d-flex align-items-center justify-content-center gap-1 ${watchlistIds.has(movie.id) ? 'btn-cv-primary' : 'btn-cv-outline'}`}
        onClick={e => { e.stopPropagation(); handleWatchlistToggle(movie); }}
        disabled={actionLoading[`wl_${movie.id}`]}
        title={watchlistIds.has(movie.id) ? 'Remove from Watchlist' : 'Add to Watchlist'}
        style={{ fontSize: '0.78rem', padding: '0.35rem 0.5rem', minWidth: 0 }}
      >
        {actionLoading[`wl_${movie.id}`]
          ? <span className="spinner-border spinner-border-sm" />
          : <i className={`bi ${watchlistIds.has(movie.id) ? 'bi-bookmark-fill' : 'bi-bookmark'}`}></i>
        }
        <span>{watchlistIds.has(movie.id) ? 'Saved' : 'Save'}</span>
      </button>
      <button
        className={`btn btn-sm d-flex align-items-center justify-content-center gap-1 ${watchedIds.has(movie.id) ? 'btn-success' : 'btn-cv-outline'}`}
        onClick={e => { e.stopPropagation(); handleMarkWatched(movie); }}
        disabled={actionLoading[`wh_${movie.id}`] || watchedIds.has(movie.id)}
        title={watchedIds.has(movie.id) ? 'Already Watched' : 'Mark as Watched'}
        style={{ fontSize: '0.78rem', padding: '0.35rem 0.6rem' }}
      >
        {actionLoading[`wh_${movie.id}`]
          ? <span className="spinner-border spinner-border-sm" />
          : <i className={`bi ${watchedIds.has(movie.id) ? 'bi-check-lg' : 'bi-eye'}`}></i>
        }
      </button>
    </div>
  );

  const hasActiveFilters = search || selectedGenre || selectedLanguage || selectedYear || sort !== 'latest';

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar currentPath="#/discover" />
      <main className="flex-grow-1 py-4">
        <div className="container">
          {/* Page Header */}
          <div className="mb-4">
            <h3 className="fw-semibold text-white mb-1">Discover Films</h3>
            <p className="text-secondary small mb-0">Browse and filter curated cinema from around the world</p>
          </div>

          {/* Search & Filters Bar */}
          <div className="glass-card p-3 p-md-4 mb-4">
            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="mb-3">
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by title, description..."
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                />
                <button type="submit" className="btn btn-cv-primary px-4 fw-medium">
                  Search
                </button>
              </div>
            </form>

            {/* Filter Row */}
            <div className="row g-2 align-items-end">
              <div className="col-6 col-md-3">
                <label className="form-label text-secondary small mb-1">Genre</label>
                <select
                  className="form-select small"
                  value={selectedGenre}
                  onChange={handleFilterChange(setSelectedGenre)}
                >
                  <option value="">All Genres</option>
                  {genres.map(g => (
                    <option key={g.id || g} value={g.name || g}>{g.name || g}</option>
                  ))}
                </select>
              </div>
              <div className="col-6 col-md-3">
                <label className="form-label text-secondary small mb-1">Language</label>
                <select
                  className="form-select small"
                  value={selectedLanguage}
                  onChange={handleFilterChange(setSelectedLanguage)}
                >
                  <option value="">All Languages</option>
                  {languages.map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              </div>
              <div className="col-6 col-md-2">
                <label className="form-label text-secondary small mb-1">Year</label>
                <input
                  type="number"
                  className="form-control small"
                  placeholder="e.g. 2023"
                  value={selectedYear}
                  onChange={handleFilterChange(setSelectedYear)}
                  min="1900" max="2030"
                />
              </div>
              <div className="col-6 col-md-3">
                <label className="form-label text-secondary small mb-1">Sort By</label>
                <select
                  className="form-select small"
                  value={sort}
                  onChange={handleFilterChange(setSort)}
                >
                  {SORT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              {hasActiveFilters && (
                <div className="col-12 col-md-1 d-flex align-items-end">
                  <button
                    className="btn btn-cv-outline w-100 py-2"
                    onClick={handleClearFilters}
                    title="Reset filters"
                    style={{ fontSize: '0.82rem' }}
                  >
                    Reset
                  </button>
                </div>
              )}
            </div>

            {/* Active Filter Pills */}
            {hasActiveFilters && (
              <div className="d-flex flex-wrap gap-2 mt-3">
                {search && (
                  <span className="badge bg-purple-subtle text-purple-light border border-purple-subtle px-3 py-2 small">
                    <i className="bi bi-search me-1"></i>"{search}"
                  </span>
                )}
                {selectedGenre && (
                  <span className="badge bg-purple-subtle text-purple-light border border-purple-subtle px-3 py-2 small">
                    <i className="bi bi-tag me-1"></i>{selectedGenre}
                  </span>
                )}
                {selectedLanguage && (
                  <span className="badge bg-info-subtle text-info border border-info-subtle px-3 py-2 small">
                    <i className="bi bi-translate me-1"></i>{selectedLanguage}
                  </span>
                )}
                {selectedYear && (
                  <span className="badge bg-warning-subtle text-warning border border-warning-subtle px-3 py-2 small">
                    <i className="bi bi-calendar me-1"></i>{selectedYear}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Results count */}
          {!loading && !error && (
            <div className="d-flex align-items-center justify-content-between mb-3">
              <p className="text-secondary small mb-0">
                {pagination.totalItems > 0
                  ? `Showing ${movies.length} of ${pagination.totalItems} films`
                  : 'No films found'}
              </p>
              <p className="text-secondary small mb-0">
                Page {pagination.currentPage} of {pagination.totalPages}
              </p>
            </div>
          )}

          {/* Movie Grid / States */}
          {loading && <LoadingSpinner message="Loading films..." />}
          {!loading && error && (
            <div className="glass-card p-4 text-center">
              <i className="bi bi-exclamation-triangle text-warning fs-2 mb-3 d-block"></i>
              <p className="text-secondary mb-3">{error}</p>
              <button className="btn btn-cv-outline" onClick={loadMovies}>Try Again</button>
            </div>
          )}
          {!loading && !error && movies.length === 0 && (
            <EmptyState
              icon="bi-film"
              title="No films found"
              subtitle="Try adjusting your search or filters to discover more cinema."
              actionLabel="Clear Filters"
              actionHref="#/discover"
            />
          )}
          {!loading && !error && movies.length > 0 && (
            <MovieGrid
              movies={movies}
              onSelect={movie => { window.location.hash = `#/movies/${movie.id}`; }}
              getActionSlot={isAuthenticated ? getActionSlot : null}
            />
          )}

          {/* Pagination */}
          {!loading && !error && pagination.totalPages > 1 && (
            <div className="d-flex justify-content-center mt-5">
              <nav aria-label="Movie pagination">
                <ul className="pagination pagination-sm gap-1 mb-0">
                  <li className={`page-item ${page <= 1 ? 'disabled' : ''}`}>
                    <button
                      className="page-link bg-dark border-secondary text-light rounded-2"
                      onClick={() => setPage(p => p - 1)}
                    >
                      <i className="bi bi-chevron-left"></i>
                    </button>
                  </li>
                  {[...Array(pagination.totalPages)].map((_, i) => (
                    <li key={i + 1} className={`page-item ${page === i + 1 ? 'active' : ''}`}>
                      <button
                        className={`page-link rounded-2 ${page === i + 1 ? 'btn-cv-primary border-0' : 'bg-dark border-secondary text-light'}`}
                        onClick={() => setPage(i + 1)}
                      >
                        {i + 1}
                      </button>
                    </li>
                  ))}
                  <li className={`page-item ${page >= pagination.totalPages ? 'disabled' : ''}`}>
                    <button
                      className="page-link bg-dark border-secondary text-light rounded-2"
                      onClick={() => setPage(p => p + 1)}
                    >
                      <i className="bi bi-chevron-right"></i>
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DiscoverPage;
