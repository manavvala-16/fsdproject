import React, { useState, useEffect } from 'react';
import { fetchMovieDNA } from '../services/api';
import ProtectedRoute from '../components/ProtectedRoute';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const MovieDNAPageContent = () => {
  const [dna, setDna] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDNA = async () => {
      setLoading(true);
      const res = await fetchMovieDNA();
      if (res.success && res.data) {
        setDna(res.data);
      }
      setLoading(false);
    };
    loadDNA();
  }, []);

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar currentPath="#/dna" />

      <main className="flex-grow-1 py-5">
        <div className="container">
          {/* Header */}
          <div className="text-center mb-5">
            <h2 className="fw-semibold text-white mb-2">Movie DNA</h2>
            <p className="text-secondary small mx-auto mb-0" style={{ maxWidth: '540px' }}>
              Your cinematic taste profile, calculated from your viewing history and ratings.
            </p>
          </div>

          {loading ? (
            <LoadingSpinner message="Analyzing your taste profile..." />
          ) : !dna || !dna.hasData || dna.genreScores.length === 0 ? (
            <div className="glass-card p-5 text-center my-4">
              <EmptyState
                icon="bi-fingerprint"
                title="Your Movie DNA is waiting"
                subtitle="Start watching films, log your ratings, and return here to see your personalized taste profile."
                actionLabel="Discover Films"
                actionHref="#/discover"
              />
            </div>
          ) : (
            <div>
              {/* Taste Summary Banner */}
              <div className="glass-card p-4 p-md-5 mb-4">
                <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-4">
                  <div style={{ maxWidth: '640px' }}>
                    <div className="text-purple-light small fw-medium mb-1">
                      Taste Summary
                    </div>
                    <h4 className="fw-semibold text-white mb-2">{dna.tasteSummary}</h4>
                    <p className="text-secondary small mb-0">
                      Calculated from your viewing history and ratings on CineVault.
                    </p>
                  </div>

                  {/* Summary Stat Pills */}
                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    <div className="glass-card p-3 text-center" style={{ minWidth: '100px' }}>
                      <div className="fs-4 fw-semibold text-white">{dna.watchedCount}</div>
                      <div className="small text-secondary" style={{ fontSize: '0.75rem' }}>Films Watched</div>
                    </div>
                    <div className="glass-card p-3 text-center" style={{ minWidth: '100px' }}>
                      <div className="fs-4 fw-semibold text-purple-light">{dna.ratedCount}</div>
                      <div className="small text-secondary" style={{ fontSize: '0.75rem' }}>Rated</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Section: Genre Affinity Breakdown */}
              <div className="row g-4 mb-4">
                <div className="col-lg-8">
                  <div className="glass-card p-4 h-100">
                    <div className="d-flex align-items-center justify-content-between mb-4 pb-2" style={{ borderBottom: '1px solid var(--cv-border-subtle)' }}>
                      <h5 className="fw-semibold text-white mb-0">Genre Affinity</h5>
                      <span className="text-secondary small">Score (0–100)</span>
                    </div>

                    <div className="d-flex flex-column gap-3">
                      {dna.genreScores.map((g, index) => (
                        <div key={g.genre}>
                          <div className="d-flex align-items-center justify-content-between mb-1">
                            <span className="fw-medium text-white small d-flex align-items-center gap-2">
                              <span className="text-secondary small" style={{ minWidth: '18px' }}>{index + 1}.</span>
                              {g.genre}
                            </span>
                            <div className="d-flex align-items-center gap-3">
                              <span className="small text-secondary">{g.count} {g.count === 1 ? 'film' : 'films'}</span>
                              <span className="fw-medium text-white small">{g.score}</span>
                            </div>
                          </div>
                          <div className="progress" style={{ height: '5px', backgroundColor: '#1f1b2e' }}>
                            <div
                              className="progress-bar"
                              role="progressbar"
                              style={{ width: `${g.score}%`, backgroundColor: 'var(--cv-purple)', borderRadius: '3px' }}
                              aria-valuenow={g.score}
                              aria-valuemin="0"
                              aria-valuemax="100"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Taste Insights */}
                <div className="col-lg-4">
                  <div className="d-flex flex-column gap-3 h-100">
                    <div className="glass-card p-4 flex-grow-1">
                      <div className="text-secondary small mb-1">Release Era</div>
                      <h6 className="fw-semibold text-white mb-2">
                        {dna.insights?.preferredEra ? `${dna.insights.preferredEra} Cinema` : 'Diverse Decades'}
                      </h6>
                      <p className="text-secondary small mb-0" style={{ lineHeight: '1.5' }}>
                        {dna.insights?.preferredEra
                          ? `You gravitate toward productions from the ${dna.insights.preferredEra}.`
                          : 'Explore more eras to uncover time-period tendencies.'}
                      </p>
                    </div>

                    <div className="glass-card p-4 flex-grow-1">
                      <div className="text-secondary small mb-1">Runtime Pace</div>
                      <h6 className="fw-semibold text-white mb-2">
                        {dna.insights?.typicalRuntime || 'Flexible Duration'}
                      </h6>
                      <p className="text-secondary small mb-0" style={{ lineHeight: '1.5' }}>
                        {dna.insights?.typicalRuntime
                          ? `Your typical viewing length averages around ${dna.insights.typicalRuntime}.`
                          : 'Runtime averages calibrate as you log more viewings.'}
                      </p>
                    </div>

                    <div className="glass-card p-4 flex-grow-1">
                      <div className="text-secondary small mb-1">Primary Language</div>
                      <h6 className="fw-semibold text-white mb-2">
                        {dna.insights?.dominantLanguage || 'International'}
                      </h6>
                      <p className="text-secondary small mb-0" style={{ lineHeight: '1.5' }}>
                        {dna.insights?.dominantLanguage
                          ? `Most of your viewing is in ${dna.insights.dominantLanguage}.`
                          : 'Discover world cinema across various global regions.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Call to Recommendations */}
              <div className="glass-card p-4 p-md-4 text-center">
                <h5 className="fw-semibold text-white mb-2">Ready to explore films tailored to your DNA?</h5>
                <p className="text-secondary small mb-4 mx-auto" style={{ maxWidth: '480px' }}>
                  Recommendations use these genre preferences to suggest matching titles from our catalog.
                </p>
                <div className="d-flex align-items-center justify-content-center gap-2 flex-wrap">
                  <a href="#/recommendations" className="btn btn-cv-primary px-3 py-2">
                    View Recommendations
                  </a>
                  <a href="#/discover" className="btn btn-cv-outline px-3 py-2">
                    Browse All Films
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

const MovieDNAPage = () => (
  <ProtectedRoute>
    <MovieDNAPageContent />
  </ProtectedRoute>
);

export default MovieDNAPage;
