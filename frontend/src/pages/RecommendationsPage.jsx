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
    <div className="d-flex flex-column min-vh-100">
      <Navbar currentPath="#/recommendations" />

      <main className="flex-grow-1 py-5">
        <div className="container">
          {/* Header */}
          <div className="text-center mb-4">
            <h2 className="fw-semibold text-white mb-2">Recommended For You</h2>
            <p className="text-secondary small mx-auto mb-0" style={{ maxWidth: '540px' }}>
              Handpicked cinema based on your unique Movie DNA, ratings, and viewing history.
            </p>
          </div>

          {/* Explanation Banner */}
          <div className="glass-card p-3 p-md-4 mb-4 d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
            <div>
              <h6 className="fw-semibold text-white mb-1">
                {isPersonalized ? 'Personalized Cinema Recommendations' : 'Curated Spotlight Recommendations'}
              </h6>
              <p className="text-secondary small mb-0">
                {isPersonalized
                  ? 'Recommendations are generated in real-time by analyzing your movie ratings and viewing history.'
                  : 'Showing critically acclaimed cinema until you log and rate more titles in your collection.'}
              </p>
            </div>

            <a href="#/dna" className="btn btn-cv-outline btn-sm px-3 py-2 text-nowrap align-self-start align-self-md-center">
              View Taste Profile
            </a>
          </div>

          {loading ? (
            <LoadingSpinner message="Calculating recommendations..." />
          ) : recommendations.length === 0 ? (
            <EmptyState
              icon="bi-film"
              title="No recommendations available"
              subtitle="You've explored all currently recommended cinema. Check back as new films are added."
              actionLabel="Discover Movies"
              actionHref="#/discover"
            />
          ) : (
            <div className="row g-3 g-md-4">
              {recommendations.map(movie => {
                const inWatchlist = watchlistIds.has(movie.id);
                return (
                  <div key={movie.id} className="col-12 col-sm-6 col-lg-4 col-xl-3">
                    <div
                      className="glass-card cv-card-interactive h-100 d-flex flex-column overflow-hidden position-relative"
                      onClick={() => { window.location.hash = `#/movies/${movie.id}`; }}
                      style={{ cursor: 'pointer' }}
                    >
                      {/* Movie Poster & Reason Tag Overlay */}
                      <div className="position-relative overflow-hidden" style={{ paddingTop: '140%', backgroundColor: '#0f0c1b' }}>
                        <img
                          src={movie.poster_url || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600'}
                          alt={movie.title}
                          className="position-absolute top-0 start-0 w-100 h-100 object-fit-cover"
                        />

                        {/* Recommendation Match Badge */}
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

                        {/* Watchlist Quick Button */}
                        <button
                          className="btn btn-sm position-absolute top-0 start-0 m-2 rounded-1 p-0 d-flex align-items-center justify-content-center text-white"
                          style={{
                            width: '28px',
                            height: '28px',
                            backgroundColor: inWatchlist ? 'var(--cv-purple)' : 'rgba(13, 11, 20, 0.85)',
                            border: '1px solid rgba(255, 255, 255, 0.15)'
                          }}
                          onClick={(e) => handleToggleWatchlist(e, movie.id)}
                          disabled={watchlistActionId === movie.id}
                          title={inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
                        >
                          {watchlistActionId === movie.id ? (
                            <span className="spinner-border spinner-border-sm" role="status"></span>
                          ) : (
                            <i className={`bi ${inWatchlist ? 'bi-bookmark-check-fill' : 'bi-bookmark'}`} style={{ fontSize: '0.8rem' }}></i>
                          )}
                        </button>
                      </div>

                      {/* Card Body */}
                      <div className="p-3 d-flex flex-column flex-grow-1 justify-content-between">
                        <div>
                          <div className="d-flex align-items-start justify-content-between gap-2 mb-1">
                            <h6 className="fw-semibold text-white mb-0 text-truncate" title={movie.title} style={{ fontSize: '0.925rem' }}>
                              {movie.title}
                            </h6>
                            <span className="text-secondary small" style={{ fontSize: '0.8rem' }}>
                              {movie.release_year}
                            </span>
                          </div>

                          <div className="d-flex align-items-center justify-content-between small text-secondary mb-2" style={{ fontSize: '0.8rem' }}>
                            <span className="text-truncate">{movie.director_name || 'Curated'}</span>
                            <span className="text-warning">★ {movie.avg_rating}</span>
                          </div>
                        </div>

                        <div
                          className="p-1 px-2 rounded small text-secondary text-truncate mt-2"
                          style={{ fontSize: '0.72rem', background: 'rgba(255, 255, 255, 0.04)' }}
                        >
                          {movie.recommendationReason}
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
