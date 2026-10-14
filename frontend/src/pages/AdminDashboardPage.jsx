import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  fetchAdminStats,
  fetchAdminMovies,
  createAdminMovie,
  updateAdminMovie,
  deleteAdminMovie,
  fetchAdminUsers,
  updateAdminUserRole,
  fetchAdminReviews,
  deleteAdminReview
} from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminDashboardPage = () => {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'movies' | 'users' | 'reviews'

  // Overview Stats
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Movies State
  const [movies, setMovies] = useState([]);
  const [moviesPagination, setMoviesPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });
  const [movieSearch, setMovieSearch] = useState('');
  const [moviesLoading, setMoviesLoading] = useState(false);
  const [showMovieForm, setShowMovieForm] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [movieForm, setMovieForm] = useState({
    title: '',
    release_year: new Date().getFullYear(),
    language: 'English',
    runtime: 120,
    director_name: '',
    genres: '',
    poster_url: '',
    backdrop_url: '',
    description: ''
  });

  // Users State
  const [users, setUsers] = useState([]);
  const [usersPagination, setUsersPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });
  const [userSearch, setUserSearch] = useState('');
  const [usersLoading, setUsersLoading] = useState(false);

  // Reviews State
  const [reviews, setReviews] = useState([]);
  const [reviewsPagination, setReviewsPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });
  const [reviewSearch, setReviewSearch] = useState('');
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // Feedback Notification
  const [feedback, setFeedback] = useState(null); // { type: 'success'|'danger', text: '' }

  const showFeedback = (text, type = 'success') => {
    setFeedback({ text, type });
    setTimeout(() => setFeedback(null), 4500);
  };

  // Load Overview Stats
  const loadStats = async () => {
    setStatsLoading(true);
    const res = await fetchAdminStats();
    if (res.success && res.data) {
      setStats(res.data);
    }
    setStatsLoading(false);
  };

  // Load Movies
  const loadMovies = async (page = 1, search = movieSearch) => {
    setMoviesLoading(true);
    const res = await fetchAdminMovies({ page, limit: 10, search });
    if (res.success) {
      setMovies(res.data);
      if (res.pagination) setMoviesPagination(res.pagination);
    }
    setMoviesLoading(false);
  };

  // Load Users
  const loadUsers = async (page = 1, search = userSearch) => {
    setUsersLoading(true);
    const res = await fetchAdminUsers({ page, limit: 10, search });
    if (res.success) {
      setUsers(res.data);
      if (res.pagination) setUsersPagination(res.pagination);
    }
    setUsersLoading(false);
  };

  // Load Reviews
  const loadReviews = async (page = 1, search = reviewSearch) => {
    setReviewsLoading(true);
    const res = await fetchAdminReviews({ page, limit: 10, search });
    if (res.success) {
      setReviews(res.data);
      if (res.pagination) setReviewsPagination(res.pagination);
    }
    setReviewsLoading(false);
  };

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'movies') loadMovies(1);
    if (activeTab === 'users') loadUsers(1);
    if (activeTab === 'reviews') loadReviews(1);
  }, [activeTab]);

  // Handle Movie Save (Create or Update)
  const handleSaveMovie = async (e) => {
    e.preventDefault();
    if (!movieForm.title.trim()) {
      showFeedback('Movie title is required.', 'danger');
      return;
    }

    const payload = {
      ...movieForm,
      release_year: parseInt(movieForm.release_year, 10),
      runtime: parseInt(movieForm.runtime, 10) || null,
      genres: movieForm.genres.split(',').map(g => g.trim()).filter(Boolean)
    };

    if (editingMovie) {
      const res = await updateAdminMovie(editingMovie.id, payload);
      if (res.success) {
        showFeedback(res.message || 'Movie updated successfully.');
        setShowMovieForm(false);
        setEditingMovie(null);
        loadMovies(moviesPagination.currentPage);
      } else {
        showFeedback(res.message || 'Failed to update movie.', 'danger');
      }
    } else {
      const res = await createAdminMovie(payload);
      if (res.success) {
        showFeedback(res.message || 'Movie created successfully.');
        setShowMovieForm(false);
        loadMovies(1);
        loadStats();
      } else {
        showFeedback(res.message || 'Failed to create movie.', 'danger');
      }
    }
  };

  const handleOpenEditMovie = (m) => {
    setEditingMovie(m);
    setMovieForm({
      title: m.title || '',
      release_year: m.release_year || new Date().getFullYear(),
      language: m.language || 'English',
      runtime: m.runtime || 120,
      director_name: m.director_name || '',
      genres: Array.isArray(m.genres) ? m.genres.join(', ') : '',
      poster_url: m.poster_url || '',
      backdrop_url: m.backdrop_url || '',
      description: m.description || ''
    });
    setShowMovieForm(true);
  };

  const handleDeleteMovie = async (m) => {
    if (window.confirm(`Are you sure you want to delete "${m.title}"? This will safely remove it and related records.`)) {
      const res = await deleteAdminMovie(m.id);
      if (res.success) {
        showFeedback(res.message || 'Movie deleted successfully.');
        loadMovies(moviesPagination.currentPage);
        loadStats();
      } else {
        showFeedback(res.message || 'Failed to delete movie.', 'danger');
      }
    }
  };

  // Handle User Role Toggle
  const handleToggleRole = async (targetUser) => {
    const newRole = targetUser.role === 'admin' ? 'user' : 'admin';
    if (targetUser.id === user.id && newRole === 'user') {
      showFeedback('Self-demotion protection: You cannot remove your own administrator status.', 'danger');
      return;
    }

    if (window.confirm(`Change role for ${targetUser.name} to "${newRole.toUpperCase()}"?`)) {
      const res = await updateAdminUserRole(targetUser.id, newRole);
      if (res.success) {
        showFeedback(res.message || 'User role updated.');
        loadUsers(usersPagination.currentPage);
        loadStats();
      } else {
        showFeedback(res.message || 'Failed to update role.', 'danger');
      }
    }
  };

  // Handle Review Delete
  const handleDeleteReview = async (review) => {
    if (window.confirm('Are you sure you want to moderate and remove this review?')) {
      const res = await deleteAdminReview(review.id);
      if (res.success) {
        showFeedback(res.message || 'Review removed.');
        loadReviews(reviewsPagination.currentPage);
        loadStats();
      } else {
        showFeedback(res.message || 'Failed to remove review.', 'danger');
      }
    }
  };

  // Role Gate
  if (!isAdmin) {
    return (
      <div className="d-flex flex-column min-vh-100 bg-dark text-light">
        <Navbar />
        <main className="flex-grow-1 d-flex align-items-center justify-content-center py-5">
          <div className="glass-card p-5 text-center" style={{ maxWidth: '480px' }}>
            <div className="text-warning fs-1 mb-3">
              <i className="bi bi-shield-lock-fill"></i>
            </div>
            <h3 className="fw-bold text-white mb-2">Access Denied</h3>
            <p className="text-secondary small mb-4">
              Administrator privileges are required to view this area. You do not have authorization to access the Admin Dashboard.
            </p>
            <a href="#/" className="btn btn-cv-primary px-4 py-2">
              Return to CineVault
            </a>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="d-flex flex-column min-vh-100 bg-dark text-light">
      <Navbar currentPath="#/admin" />

      <main className="flex-grow-1 py-4 py-lg-5">
        <div className="container-fluid px-lg-5">
          {/* Dashboard Header */}
          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4 pb-3 border-bottom border-secondary border-opacity-25">
            <div>
              <div className="d-flex align-items-center gap-2 mb-1">
                <span className="badge bg-warning text-dark px-2 py-1 small fw-bold">ADMINISTRATION</span>
                <span className="text-secondary small">•</span>
                <span className="text-secondary small">Platform Management Suite</span>
              </div>
              <h2 className="fw-bold text-white mb-0">CineVault Control Center</h2>
            </div>
            <div className="d-flex align-items-center gap-2">
              <a href="#/" className="btn btn-cv-outline btn-sm px-3 py-2 d-inline-flex align-items-center gap-2">
                <i className="bi bi-box-arrow-up-right"></i> Return to CineVault
              </a>
            </div>
          </div>

          {/* Feedback Alert */}
          {feedback && (
            <div className={`alert alert-${feedback.type} alert-dismissible fade show d-flex align-items-center gap-2 mb-4`} role="alert">
              <i className={`bi ${feedback.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'}`}></i>
              <div>{feedback.text}</div>
              <button type="button" className="btn-close" onClick={() => setFeedback(null)} aria-label="Close"></button>
            </div>
          )}

          {/* Nav Tabs Bar */}
          <div className="nav nav-pills gap-2 mb-4 p-2 rounded-3 bg-dark border border-secondary border-opacity-25">
            <button
              className={`nav-link fw-semibold px-4 py-2 ${activeTab === 'overview' ? 'active bg-purple text-white' : 'text-secondary'}`}
              onClick={() => setActiveTab('overview')}
            >
              <i className="bi bi-speedometer2 me-2"></i>Overview
            </button>
            <button
              className={`nav-link fw-semibold px-4 py-2 ${activeTab === 'movies' ? 'active bg-purple text-white' : 'text-secondary'}`}
              onClick={() => setActiveTab('movies')}
            >
              <i className="bi bi-film me-2"></i>Movies ({stats?.totalMovies || 0})
            </button>
            <button
              className={`nav-link fw-semibold px-4 py-2 ${activeTab === 'users' ? 'active bg-purple text-white' : 'text-secondary'}`}
              onClick={() => setActiveTab('users')}
            >
              <i className="bi bi-people me-2"></i>Users ({stats?.totalUsers || 0})
            </button>
            <button
              className={`nav-link fw-semibold px-4 py-2 ${activeTab === 'reviews' ? 'active bg-purple text-white' : 'text-secondary'}`}
              onClick={() => setActiveTab('reviews')}
            >
              <i className="bi bi-chat-left-text me-2"></i>Reviews ({stats?.totalReviews || 0})
            </button>
          </div>

          {/* ════ TAB 1: OVERVIEW ════ */}
          {activeTab === 'overview' && (
            <div>
              {statsLoading ? (
                <LoadingSpinner message="Aggregating platform metrics..." />
              ) : !stats ? (
                <div className="glass-card p-4 text-center">Unable to load statistics.</div>
              ) : (
                <>
                  {/* Top Stats Cards */}
                  <div className="row g-3 mb-4">
                    <div className="col-sm-6 col-xl">
                      <div className="glass-card p-4">
                        <div className="d-flex align-items-center justify-content-between mb-2">
                          <span className="text-secondary small fw-bold text-uppercase">Total Films</span>
                          <i className="bi bi-film text-purple-light fs-4"></i>
                        </div>
                        <h2 className="fw-bold text-white mb-0">{stats.totalMovies}</h2>
                        <span className="small text-secondary">In catalog</span>
                      </div>
                    </div>
                    <div className="col-sm-6 col-xl">
                      <div className="glass-card p-4">
                        <div className="d-flex align-items-center justify-content-between mb-2">
                          <span className="text-secondary small fw-bold text-uppercase">Curators</span>
                          <i className="bi bi-people-fill text-info fs-4"></i>
                        </div>
                        <h2 className="fw-bold text-white mb-0">{stats.totalUsers}</h2>
                        <span className="small text-secondary">Registered accounts</span>
                      </div>
                    </div>
                    <div className="col-sm-6 col-xl">
                      <div className="glass-card p-4">
                        <div className="d-flex align-items-center justify-content-between mb-2">
                          <span className="text-secondary small fw-bold text-uppercase">Ratings</span>
                          <i className="bi bi-star-fill text-warning fs-4"></i>
                        </div>
                        <h2 className="fw-bold text-white mb-0">{stats.totalRatings}</h2>
                        <span className="small text-secondary">Logged ratings</span>
                      </div>
                    </div>
                    <div className="col-sm-6 col-xl">
                      <div className="glass-card p-4">
                        <div className="d-flex align-items-center justify-content-between mb-2">
                          <span className="text-secondary small fw-bold text-uppercase">Reviews</span>
                          <i className="bi bi-chat-quote-fill text-success fs-4"></i>
                        </div>
                        <h2 className="fw-bold text-white mb-0">{stats.totalReviews}</h2>
                        <span className="small text-secondary">Community reviews</span>
                      </div>
                    </div>
                    <div className="col-sm-6 col-xl">
                      <div className="glass-card p-4">
                        <div className="d-flex align-items-center justify-content-between mb-2">
                          <span className="text-secondary small fw-bold text-uppercase">Public Playlists</span>
                          <i className="bi bi-collection-play-fill text-danger fs-4"></i>
                        </div>
                        <h2 className="fw-bold text-white mb-0">{stats.totalCollections}</h2>
                        <span className="small text-secondary">Public collections</span>
                      </div>
                    </div>
                  </div>

                  {/* Recent Platform Records */}
                  <div className="row g-4">
                    <div className="col-lg-6">
                      <div className="glass-card p-4 h-100">
                        <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom border-secondary border-opacity-25">
                          <h5 className="fw-bold text-white mb-0">Recently Added Films</h5>
                          <button className="btn btn-link text-purple-light text-decoration-none small p-0" onClick={() => setActiveTab('movies')}>
                            View all →
                          </button>
                        </div>
                        {stats.recentMovies?.length === 0 ? (
                          <p className="text-secondary small">No movies recorded yet.</p>
                        ) : (
                          <div className="d-flex flex-column gap-3">
                            {stats.recentMovies.map(m => (
                              <div key={m.id} className="d-flex align-items-center justify-content-between gap-3">
                                <div className="d-flex align-items-center gap-3">
                                  <img
                                    src={m.poster_url || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=100'}
                                    alt={m.title}
                                    className="rounded shadow-sm"
                                    style={{ width: '36px', height: '50px', objectFit: 'cover' }}
                                  />
                                  <div>
                                    <div className="fw-semibold text-white small text-truncate" style={{ maxWidth: '220px' }}>{m.title}</div>
                                    <span className="text-secondary small">{m.release_year}</span>
                                  </div>
                                </div>
                                <a href={`#/movies/${m.id}`} className="btn btn-cv-outline btn-sm py-1 px-2" style={{ fontSize: '0.75rem' }}>
                                  Inspect
                                </a>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="col-lg-6">
                      <div className="glass-card p-4 h-100">
                        <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom border-secondary border-opacity-25">
                          <h5 className="fw-bold text-white mb-0">Recently Joined Curators</h5>
                          <button className="btn btn-link text-purple-light text-decoration-none small p-0" onClick={() => setActiveTab('users')}>
                            View all →
                          </button>
                        </div>
                        {stats.recentUsers?.length === 0 ? (
                          <p className="text-secondary small">No users registered yet.</p>
                        ) : (
                          <div className="d-flex flex-column gap-3">
                            {stats.recentUsers.map(u => (
                              <div key={u.id} className="d-flex align-items-center justify-content-between gap-3">
                                <div className="d-flex align-items-center gap-3">
                                  <div
                                    className="rounded-circle bg-purple-gradient text-white d-flex align-items-center justify-content-center fw-bold small flex-shrink-0"
                                    style={{ width: '36px', height: '36px' }}
                                  >
                                    {u.name?.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <div className="fw-semibold text-white small">{u.name}</div>
                                    <span className="text-secondary small">{u.email}</span>
                                  </div>
                                </div>
                                <span className={`badge ${u.role === 'admin' ? 'bg-warning text-dark' : 'bg-dark border border-secondary text-secondary'} small`}>
                                  {u.role?.toUpperCase()}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ════ TAB 2: MOVIES ════ */}
          {activeTab === 'movies' && (
            <div>
              {/* Actions Header */}
              <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
                <form
                  onSubmit={(e) => { e.preventDefault(); loadMovies(1, movieSearch); }}
                  className="d-flex align-items-center gap-2 flex-grow-1"
                  style={{ maxWidth: '420px' }}
                >
                  <input
                    type="text"
                    className="form-control bg-dark text-light border-secondary"
                    placeholder="Search films by title or director..."
                    value={movieSearch}
                    onChange={(e) => setMovieSearch(e.target.value)}
                  />
                  <button type="submit" className="btn btn-cv-primary px-3 text-nowrap">
                    <i className="bi bi-search"></i> Search
                  </button>
                </form>

                <button
                  className="btn btn-success d-inline-flex align-items-center gap-2 px-4 py-2"
                  onClick={() => {
                    setEditingMovie(null);
                    setMovieForm({
                      title: '',
                      release_year: new Date().getFullYear(),
                      language: 'English',
                      runtime: 120,
                      director_name: '',
                      genres: '',
                      poster_url: '',
                      backdrop_url: '',
                      description: ''
                    });
                    setShowMovieForm(true);
                  }}
                >
                  <i className="bi bi-plus-circle-fill"></i> Add New Film
                </button>
              </div>

              {/* Add / Edit Movie Modal / Box */}
              {showMovieForm && (
                <div className="glass-card p-4 p-md-5 mb-4 position-relative border-purple">
                  <div className="d-flex align-items-center justify-content-between mb-4 pb-2 border-bottom border-secondary border-opacity-25">
                    <h4 className="fw-bold text-white mb-0">
                      {editingMovie ? `Edit Film: ${editingMovie.title}` : 'Add New Film to Catalog'}
                    </h4>
                    <button className="btn btn-outline-secondary btn-sm" onClick={() => setShowMovieForm(false)}>
                      <i className="bi bi-x-lg"></i> Cancel
                    </button>
                  </div>

                  <form onSubmit={handleSaveMovie}>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label text-secondary small fw-semibold">Film Title *</label>
                        <input
                          type="text"
                          className="form-control bg-dark text-light border-secondary"
                          value={movieForm.title}
                          onChange={(e) => setMovieForm({ ...movieForm, title: e.target.value })}
                          required
                        />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label text-secondary small fw-semibold">Release Year *</label>
                        <input
                          type="number"
                          className="form-control bg-dark text-light border-secondary"
                          value={movieForm.release_year}
                          onChange={(e) => setMovieForm({ ...movieForm, release_year: e.target.value })}
                          required
                        />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label text-secondary small fw-semibold">Runtime (Minutes)</label>
                        <input
                          type="number"
                          className="form-control bg-dark text-light border-secondary"
                          value={movieForm.runtime}
                          onChange={(e) => setMovieForm({ ...movieForm, runtime: e.target.value })}
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label text-secondary small fw-semibold">Director</label>
                        <input
                          type="text"
                          className="form-control bg-dark text-light border-secondary"
                          placeholder="e.g. Christopher Nolan"
                          value={movieForm.director_name}
                          onChange={(e) => setMovieForm({ ...movieForm, director_name: e.target.value })}
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label text-secondary small fw-semibold">Language</label>
                        <input
                          type="text"
                          className="form-control bg-dark text-light border-secondary"
                          value={movieForm.language}
                          onChange={(e) => setMovieForm({ ...movieForm, language: e.target.value })}
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label text-secondary small fw-semibold">Genres (comma separated)</label>
                        <input
                          type="text"
                          className="form-control bg-dark text-light border-secondary"
                          placeholder="Action, Sci-Fi, Thriller"
                          value={movieForm.genres}
                          onChange={(e) => setMovieForm({ ...movieForm, genres: e.target.value })}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label text-secondary small fw-semibold">Poster Image URL</label>
                        <input
                          type="url"
                          className="form-control bg-dark text-light border-secondary"
                          placeholder="https://images.unsplash.com/..."
                          value={movieForm.poster_url}
                          onChange={(e) => setMovieForm({ ...movieForm, poster_url: e.target.value })}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label text-secondary small fw-semibold">Backdrop Image URL</label>
                        <input
                          type="url"
                          className="form-control bg-dark text-light border-secondary"
                          placeholder="https://images.unsplash.com/..."
                          value={movieForm.backdrop_url}
                          onChange={(e) => setMovieForm({ ...movieForm, backdrop_url: e.target.value })}
                        />
                      </div>
                      <div className="col-12">
                        <label className="form-label text-secondary small fw-semibold">Synopsis / Description</label>
                        <textarea
                          className="form-control bg-dark text-light border-secondary"
                          rows="3"
                          value={movieForm.description}
                          onChange={(e) => setMovieForm({ ...movieForm, description: e.target.value })}
                        ></textarea>
                      </div>
                    </div>

                    <div className="d-flex align-items-center justify-content-end gap-2 mt-4">
                      <button type="button" className="btn btn-outline-secondary" onClick={() => setShowMovieForm(false)}>
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-cv-primary px-4">
                        {editingMovie ? 'Save Changes' : 'Publish Film'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Movies Table */}
              {moviesLoading ? (
                <LoadingSpinner message="Loading catalog..." />
              ) : movies.length === 0 ? (
                <div className="glass-card p-5 text-center text-secondary">No movies found matching criteria.</div>
              ) : (
                <div className="glass-card overflow-hidden">
                  <div className="table-responsive">
                    <table className="table table-dark table-hover align-middle mb-0" style={{ background: 'transparent' }}>
                      <thead className="text-secondary small text-uppercase">
                        <tr>
                          <th className="py-3 px-4">Film</th>
                          <th>Director</th>
                          <th>Year</th>
                          <th>Language</th>
                          <th>Genres</th>
                          <th>Rating</th>
                          <th className="text-end px-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {movies.map(m => (
                          <tr key={m.id}>
                            <td className="py-3 px-4">
                              <div className="d-flex align-items-center gap-3">
                                <img
                                  src={m.poster_url || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=100'}
                                  alt={m.title}
                                  className="rounded shadow-sm"
                                  style={{ width: '40px', height: '56px', objectFit: 'cover' }}
                                />
                                <div>
                                  <div className="fw-bold text-white mb-0">{m.title}</div>
                                  <span className="text-secondary small">#{m.id}</span>
                                </div>
                              </div>
                            </td>
                            <td className="text-secondary small">{m.director_name || '—'}</td>
                            <td className="text-secondary small">{m.release_year}</td>
                            <td className="text-secondary small">{m.language || 'English'}</td>
                            <td>
                              <div className="d-flex flex-wrap gap-1">
                                {(m.genres || []).slice(0, 2).map((g, idx) => (
                                  <span key={idx} className="badge bg-dark border border-secondary text-secondary small px-2 py-0">
                                    {g}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td>
                              <span className="text-warning small fw-semibold">
                                ★ {m.avg_rating || 0}
                              </span>
                            </td>
                            <td className="text-end px-4">
                              <div className="btn-group btn-group-sm">
                                <a href={`#/movies/${m.id}`} className="btn btn-outline-secondary" title="View details">
                                  <i className="bi bi-eye"></i>
                                </a>
                                <button className="btn btn-outline-info" onClick={() => handleOpenEditMovie(m)} title="Edit movie">
                                  <i className="bi bi-pencil"></i>
                                </button>
                                <button className="btn btn-outline-danger" onClick={() => handleDeleteMovie(m)} title="Delete movie">
                                  <i className="bi bi-trash"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="p-3 d-flex align-items-center justify-content-between border-top border-secondary border-opacity-25 small text-secondary">
                    <span>Showing {movies.length} of {moviesPagination.totalItems} films</span>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-outline-secondary btn-sm"
                        disabled={moviesPagination.currentPage <= 1}
                        onClick={() => loadMovies(moviesPagination.currentPage - 1)}
                      >
                        Previous
                      </button>
                      <button
                        className="btn btn-outline-secondary btn-sm"
                        disabled={moviesPagination.currentPage >= moviesPagination.totalPages}
                        onClick={() => loadMovies(moviesPagination.currentPage + 1)}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ════ TAB 3: USERS ════ */}
          {activeTab === 'users' && (
            <div>
              <div className="d-flex align-items-center justify-content-between gap-3 mb-4">
                <form
                  onSubmit={(e) => { e.preventDefault(); loadUsers(1, userSearch); }}
                  className="d-flex align-items-center gap-2 flex-grow-1"
                  style={{ maxWidth: '420px' }}
                >
                  <input
                    type="text"
                    className="form-control bg-dark text-light border-secondary"
                    placeholder="Search users by name or email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                  />
                  <button type="submit" className="btn btn-cv-primary px-3 text-nowrap">
                    <i className="bi bi-search"></i> Search
                  </button>
                </form>
              </div>

              {usersLoading ? (
                <LoadingSpinner message="Loading user directory..." />
              ) : users.length === 0 ? (
                <div className="glass-card p-5 text-center text-secondary">No members found.</div>
              ) : (
                <div className="glass-card overflow-hidden">
                  <div className="table-responsive">
                    <table className="table table-dark table-hover align-middle mb-0" style={{ background: 'transparent' }}>
                      <thead className="text-secondary small text-uppercase">
                        <tr>
                          <th className="py-3 px-4">Member</th>
                          <th>Email</th>
                          <th>Joined</th>
                          <th>Role</th>
                          <th>Activity Stats</th>
                          <th className="text-end px-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map(u => (
                          <tr key={u.id}>
                            <td className="py-3 px-4">
                              <div className="d-flex align-items-center gap-3">
                                <div
                                  className="rounded-circle bg-purple-gradient text-white d-flex align-items-center justify-content-center fw-bold small flex-shrink-0"
                                  style={{ width: '38px', height: '38px' }}
                                >
                                  {u.name?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="fw-bold text-white mb-0">{u.name}</div>
                                  <span className="text-secondary small">ID: #{u.id}</span>
                                </div>
                              </div>
                            </td>
                            <td className="text-secondary small">{u.email}</td>
                            <td className="text-secondary small">
                              {new Date(u.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </td>
                            <td>
                              <span className={`badge ${u.role === 'admin' ? 'bg-warning text-dark' : 'bg-purple-subtle text-purple-light border border-purple-subtle'}`}>
                                {u.role?.toUpperCase()}
                              </span>
                            </td>
                            <td className="text-secondary small">
                              {u.ratings_count || 0} ratings • {u.collections_count || 0} collections
                            </td>
                            <td className="text-end px-4">
                              <div className="btn-group btn-group-sm">
                                <a href={`#/users/${u.id}`} className="btn btn-outline-secondary" title="View Public Profile">
                                  <i className="bi bi-eye"></i>
                                </a>
                                <button
                                  className={`btn ${u.role === 'admin' ? 'btn-outline-warning' : 'btn-outline-info'}`}
                                  onClick={() => handleToggleRole(u)}
                                  title={u.role === 'admin' ? 'Demote to user' : 'Promote to admin'}
                                >
                                  {u.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="p-3 d-flex align-items-center justify-content-between border-top border-secondary border-opacity-25 small text-secondary">
                    <span>Showing {users.length} of {usersPagination.totalItems} members</span>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-outline-secondary btn-sm"
                        disabled={usersPagination.currentPage <= 1}
                        onClick={() => loadUsers(usersPagination.currentPage - 1)}
                      >
                        Previous
                      </button>
                      <button
                        className="btn btn-outline-secondary btn-sm"
                        disabled={usersPagination.currentPage >= usersPagination.totalPages}
                        onClick={() => loadUsers(usersPagination.currentPage + 1)}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ════ TAB 4: REVIEWS ════ */}
          {activeTab === 'reviews' && (
            <div>
              <div className="d-flex align-items-center justify-content-between gap-3 mb-4">
                <form
                  onSubmit={(e) => { e.preventDefault(); loadReviews(1, reviewSearch); }}
                  className="d-flex align-items-center gap-2 flex-grow-1"
                  style={{ maxWidth: '420px' }}
                >
                  <input
                    type="text"
                    className="form-control bg-dark text-light border-secondary"
                    placeholder="Search reviews by text or author..."
                    value={reviewSearch}
                    onChange={(e) => setReviewSearch(e.target.value)}
                  />
                  <button type="submit" className="btn btn-cv-primary px-3 text-nowrap">
                    <i className="bi bi-search"></i> Search
                  </button>
                </form>
              </div>

              {reviewsLoading ? (
                <LoadingSpinner message="Loading reviews for moderation..." />
              ) : reviews.length === 0 ? (
                <div className="glass-card p-5 text-center text-secondary">No reviews found.</div>
              ) : (
                <div className="glass-card overflow-hidden">
                  <div className="table-responsive">
                    <table className="table table-dark table-hover align-middle mb-0" style={{ background: 'transparent' }}>
                      <thead className="text-secondary small text-uppercase">
                        <tr>
                          <th className="py-3 px-4">Film</th>
                          <th>Author</th>
                          <th>Review Text</th>
                          <th>Date</th>
                          <th className="text-end px-4">Moderation</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reviews.map(r => (
                          <tr key={r.id}>
                            <td className="py-3 px-4">
                              <div className="d-flex align-items-center gap-2">
                                <img
                                  src={r.poster_url || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=100'}
                                  alt={r.movie_title}
                                  className="rounded shadow-sm"
                                  style={{ width: '32px', height: '44px', objectFit: 'cover' }}
                                />
                                <span className="fw-semibold text-white small">{r.movie_title}</span>
                              </div>
                            </td>
                            <td>
                              <div className="small">
                                <span className="text-light fw-medium">{r.user_name}</span>
                                <div className="text-secondary" style={{ fontSize: '0.75rem' }}>{r.user_email}</div>
                              </div>
                            </td>
                            <td style={{ maxWidth: '380px' }}>
                              <p className="text-light small mb-0 text-truncate" title={r.review_text}>
                                {r.review_text}
                              </p>
                            </td>
                            <td className="text-secondary small text-nowrap">
                              {new Date(r.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </td>
                            <td className="text-end px-4">
                              <button
                                className="btn btn-outline-danger btn-sm d-inline-flex align-items-center gap-1"
                                onClick={() => handleDeleteReview(r)}
                                title="Delete this review"
                              >
                                <i className="bi bi-trash"></i> Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="p-3 d-flex align-items-center justify-content-between border-top border-secondary border-opacity-25 small text-secondary">
                    <span>Showing {reviews.length} of {reviewsPagination.totalItems} reviews</span>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-outline-secondary btn-sm"
                        disabled={reviewsPagination.currentPage <= 1}
                        onClick={() => loadReviews(reviewsPagination.currentPage - 1)}
                      >
                        Previous
                      </button>
                      <button
                        className="btn btn-outline-secondary btn-sm"
                        disabled={reviewsPagination.currentPage >= reviewsPagination.totalPages}
                        onClick={() => loadReviews(reviewsPagination.currentPage + 1)}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AdminDashboardPage;
