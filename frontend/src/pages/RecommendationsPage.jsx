import React, { useState, useEffect } from 'react';
import { fetchRecommendations, addToWatchlist, removeFromWatchlist, fetchWatchlist } from '../services/api';
import ProtectedRoute from '../components/ProtectedRoute';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const RecommendationsPageContent = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [watchlistIds, setWatchlistIds] = useState(new Set());
  const [isPersonalized, setIsPersonalized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [watchlistActionId, setWatchlistActionId] = useState(null);

  const loadData = async () => {
    setLoading(true);
    const [recRes, wlRes] = await Promise.all([
      fetchRecommendations({ limit: 12 }),
      fetchWatchlist()
    ]);

    if (recRes.success && recRes.data) {
      setRecommendations(recRes.data);
      setIsPersonalized(recRes.isPersonalized);
    }
    if (wlRes.success && wlRes.data) {
      setWatchlistIds(new Set(wlRes.data.map(m => m.id)));
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleWatchlist = async (e, movieId) => {
    e.stopPropagation();
    setWatchlistActionId(movieId);

    if (watchlistIds.has(movieId)) {
      const res = await removeFromWatchlist(movieId);
      if (res.success) {
        setWatchlistIds(prev => {
          const next = new Set(prev);
          next.delete(movieId);
          return next;
        });
      }
    } else {
      const res = await addToWatchlist(movieId);
      if (res.success) {
        setWatchlistIds(prev => {
          const next = new Set(prev);
          next.add(movieId);
          return next;
        });
      }
    }

    setWatchlistActionId(null);
  };

  return (
    <div className="d-flex flex-column min-vh-100 bg-dark text-light">
      <Navbar currentPath="#/recommendations" />

      <main className="flex-grow-1 py-5">
        <div className="container">
          {/* Header */}
          <div className="text-center mb-5">
            <div
              className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill mb-3"
              style={{ background: 'rgba(138, 43, 226, 0.15)', border: '1px solid rgba(138, 43, 226, 0.4)' }}
            >
              <i className="bi bi-stars text-purple-light"></i>
              <span className="small fw-semibold text-purple-light">Explainable Recommendation Engine</span>
            </div>
            <h1 className="display-5 fw-bold text-white mb-3">Recommended For You</h1>
            <p className="text-secondary lead mx-auto" style={{ maxWidth: '640px' }}>
              Handpicked cinema based on your unique Movie DNA, ratings, and viewing history.
            </p>
          </div>

          {/* Fallback Notice or DNA link */}
          <div className="glass-card p-4 mb-5 d-flex flex-column flex-md-row align-items-center justify-content-between gap-3">
            <div className="d-flex align-items-center gap-3">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center p-3 text-purple-light flex-shrink-0"
                style={{ background: 'rgba(168, 85, 247, 0.15)' }}
              >
                <i className="bi bi-info-circle-fill fs-4"></i>
              </div>
              <div>
                <h6 className="fw-bold text-white mb-1">
                  {isPersonalized ? 'Personalized Cinema Recommendations' : 'Curated Spotlight Recommendations'}
                </h6>
                <p className="text-secondary small mb-0">
                  {isPersonalized
                    ? 'Recommendations are generated in real-time by analyzing your movie ratings and viewing history.'
                    : 'Showing popular and critically acclaimed cinema until you log and rate more titles in your collection.'}
                </p>
              </div>
            </div>

            <a href="#/dna" className="btn btn-cv-outline btn-sm px-3 py-2 text-nowrap d-inline-flex align-items-center gap-2">
              <i className="bi bi-fingerprint"></i> View Your Movie DNA
            </a>
          </div>

          {loading ? (
            <LoadingSpinner message="Calculating personalized recommendations..." />
          ) : recommendations.length === 0 ? (
            <EmptyState
              icon="bi-film"
              title="No Recommendations Available"
              subtitle="You've explored all currently recommended cinema! Check back as new films are added."
              actionLabel="Discover Movies"
              actionHref="#/discover"
            />
          ) : (
            <div className="row g-4">
              {recommendations.map(movie => {
                const inWatchlist = watchlistIds.has(movie.id);
                return (
                  <div key={movie.id} className="col-12 col-sm-6 col-lg-4 col-xl-3">
                    <div
                      className="glass-card h-100 d-flex flex-column overflow-hidden hover-scale position-relative cursor-pointer"
                      onClick={() => { window.location.hash = `#/movies/${movie.id}`; }}
                      style={{ cursor: 'pointer' }}
                    >
                      {/* Movie Poster & Reason Tag Overlay */}
                      <div className="position-relative overflow-hidden" style={{ paddingTop: '140%' }}>
                        <img
                          src={movie.poster_url || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600'}
                          alt={movie.title}
                          className="position-absolute top-0 start-0 w-100 h-100"
                          style={{ objectFit: 'cover' }}
                        />

                        {/* Recommendation Match Badge */}
                        <div
                          className="position-absolute top-0 end-0 m-2 px-2 py-1 rounded-pill small fw-bold text-white shadow"
                          style={{
                            background: 'rgba(11, 9, 20, 0.85)',
                            backdropFilter: 'blur(8px)',
                            border: '1px solid rgba(168, 85, 247, 0.4)',
                            fontSize: '0.75rem'
                          }}
                        >
                          <i className="bi bi-stars text-warning me-1"></i>
                          {movie.recommendationScore}% Match
                        </div>

                        {/* Watchlist Quick Button */}
                        <button
                          className={`btn btn-sm position-absolute top-0 start-0 m-2 rounded-circle p-0 d-flex align-items-center justify-content-center shadow ${
                            inWatchlist ? 'btn-purple text-white' : 'btn-dark text-secondary'
                          }`}
                          style={{ width: '34px', height: '34px', border: '1px solid rgba(255,255,255,0.15)' }}
                          onClick={(e) => handleToggleWatchlist(e, movie.id)}
                          disabled={watchlistActionId === movie.id}
                          title={inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
                        >
                          {watchlistActionId === movie.id ? (
                            <span className="spinner-border spinner-border-sm" role="status"></span>
                          ) : (
                            <i className={`bi ${inWatchlist ? 'bi-bookmark-check-fill' : 'bi-bookmark-plus'}`}></i>
                          )}
                        </button>
                      </div>

                      {/* Card Body */}
                      <div className="p-3 d-flex flex-column flex-grow-1 justify-content-between">
                        <div>
                          {/* Title & Year */}
                          <div className="d-flex align-items-start justify-content-between gap-2 mb-1">
                            <h5 className="fw-bold text-white mb-0 text-truncate" title={movie.title}>
                              {movie.title}
                            </h5>
                            <span className="text-secondary small fw-medium text-nowrap">
                              {movie.release_year}
                            </span>
                          </div>

                          {/* Director & Rating */}
                          <div className="d-flex align-items-center justify-content-between small text-secondary mb-2">
                            <span className="text-truncate">{movie.director_name || 'Cinema Classic'}</span>
                            <span className="text-warning fw-semibold d-flex align-items-center gap-1">
                              <i className="bi bi-star-fill"></i> {movie.avg_rating}
                            </span>
                          </div>

                          {/* Genres */}
                          {movie.genres && movie.genres.length > 0 && (
                            <div className="d-flex flex-wrap gap-1 mb-3">
                              {movie.genres.slice(0, 3).map((g, idx) => (
                                <span
                                  key={idx}
                                  className="badge bg-dark border border-secondary text-secondary small px-2 py-0"
                                  style={{ fontSize: '0.7rem' }}
                                >
                                  {g}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Explainable Recommendation Reason Box */}
                        <div
                          className="p-2 rounded-3 mt-2"
                          style={{
                            background: 'rgba(168, 85, 247, 0.08)',
                            border: '1px solid rgba(168, 85, 247, 0.25)'
                          }}
                        >
                          <div className="d-flex align-items-start gap-1 small text-purple-light" style={{ fontSize: '0.78rem' }}>
                            <i className="bi bi-lightbulb-fill text-warning flex-shrink-0 mt-1"></i>
                            <span className="lh-sm">{movie.recommendationReason}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

const RecommendationsPage = () => (
  <ProtectedRoute>
    <RecommendationsPageContent />
  </ProtectedRoute>
);

export default RecommendationsPage;
