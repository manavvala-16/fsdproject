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
    <div className="d-flex flex-column min-vh-100 bg-dark text-light">
      <Navbar currentPath="#/dna" />

      <main className="flex-grow-1 py-5">
        <div className="container">
          {/* Header */}
          <div className="text-center mb-5">
            <div
              className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill mb-3"
              style={{ background: 'rgba(138, 43, 226, 0.15)', border: '1px solid rgba(138, 43, 226, 0.4)' }}
            >
              <i className="bi bi-fingerprint text-purple-light"></i>
              <span className="small fw-semibold text-purple-light">Cinematic Taste Profile</span>
            </div>
            <h1 className="display-5 fw-bold text-white mb-3">Your Movie DNA</h1>
            <p className="text-secondary lead mx-auto" style={{ maxWidth: '640px' }}>
              Your unique cinema identity, computed from the films you've watched, rated, and loved on CineVault.
            </p>
          </div>

          {loading ? (
            <LoadingSpinner message="Analyzing your cinema taste profile..." />
          ) : !dna || !dna.hasData || dna.genreScores.length === 0 ? (
            <div className="glass-card p-5 text-center my-4">
              <EmptyState
                icon="bi-fingerprint"
                title="Your Movie DNA is Waiting"
                subtitle="We need a little more activity to generate your taste profile. Start watching films, rate your favourites, and check back here!"
                actionLabel="Explore Cinema"
                actionHref="#/discover"
              />
            </div>
          ) : (
            <div>
              {/* Taste Summary Banner */}
              <div className="glass-card p-4 p-md-5 mb-5 position-relative overflow-hidden">
                <div
                  className="position-absolute"
                  style={{
                    top: '-30%',
                    right: '-10%',
                    width: '340px',
                    height: '340px',
                    background: 'radial-gradient(circle, rgba(168, 85, 247, 0.18) 0%, rgba(0,0,0,0) 70%)',
                    pointerEvents: 'none'
                  }}
                />
                <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-4">
                  <div style={{ maxWidth: '720px' }}>
                    <div className="d-flex align-items-center gap-2 text-purple-light small fw-bold text-uppercase tracking-wider mb-2">
                      <i className="bi bi-stars"></i> Personal Taste Analysis
                    </div>
                    <h3 className="fw-bold text-white mb-2">{dna.tasteSummary}</h3>
                    <p className="text-secondary small mb-0">
                      Your strongest preferences are calculated from the genres of movies you've watched and rated highly.
                    </p>
                  </div>

                  {/* Summary Stat Pills */}
                  <div className="d-flex align-items-center gap-3 flex-wrap">
                    <div className="glass-card p-3 text-center" style={{ minWidth: '110px' }}>
                      <div className="fs-3 fw-bold text-white">{dna.watchedCount}</div>
                      <div className="small text-secondary">Films Watched</div>
                    </div>
                    <div className="glass-card p-3 text-center" style={{ minWidth: '110px' }}>
                      <div className="fs-3 fw-bold text-purple-light">{dna.ratedCount}</div>
                      <div className="small text-secondary">Ratings Given</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Section: Genre Affinity Breakdown */}
              <div className="row g-4 mb-5">
                <div className="col-lg-8">
                  <div className="glass-card p-4 p-md-5 h-100">
                    <div className="d-flex align-items-center justify-content-between mb-4 pb-2 border-bottom border-secondary border-opacity-25">
                      <h4 className="fw-bold text-white mb-0">
                        <i className="bi bi-bar-chart-fill text-purple-light me-2"></i>Genre Preference Scores
                      </h4>
                      <span className="text-secondary small">Normalized (0 – 100)</span>
                    </div>

                    <div className="d-flex flex-column gap-4">
                      {dna.genreScores.map((g, index) => {
                        // Vibrant gradient stops
                        const barColor = index === 0
                          ? 'linear-gradient(90deg, #8a2be2, #c084fc)'
                          : index === 1
                          ? 'linear-gradient(90deg, #7c3aed, #a855f7)'
                          : index === 2
                          ? 'linear-gradient(90deg, #6d28d9, #9333ea)'
                          : 'linear-gradient(90deg, #4c1d95, #7e22ce)';

                        return (
                          <div key={g.genre}>
                            <div className="d-flex align-items-center justify-content-between mb-2">
                              <span className="fw-semibold text-white d-flex align-items-center gap-2">
                                <span
                                  className="rounded-circle d-inline-flex align-items-center justify-content-center text-secondary small"
                                  style={{ width: '22px', height: '22px', background: 'rgba(255,255,255,0.06)', fontSize: '0.75rem' }}
                                >
                                  {index + 1}
                                </span>
                                {g.genre}
                              </span>
                              <div className="d-flex align-items-center gap-2">
                                <span className="small text-secondary">
                                  {g.count} {g.count === 1 ? 'film' : 'films'}
                                </span>
                                <span className="fw-bold text-purple-light fs-6">
                                  {g.score}<span className="text-secondary small fw-normal">/100</span>
                                </span>
                              </div>
                            </div>

                            {/* Preference Bar */}
                            <div
                              className="progress rounded-pill bg-dark"
                              style={{ height: '10px', border: '1px solid rgba(255,255,255,0.08)' }}
                            >
                              <div
                                className="progress-bar rounded-pill"
                                role="progressbar"
                                style={{
                                  width: `${g.score}%`,
                                  background: barColor,
                                  transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)'
                                }}
                                aria-valuenow={g.score}
                                aria-valuemin="0"
                                aria-valuemax="100"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Additional Taste Insights */}
                <div className="col-lg-4">
                  <div className="d-flex flex-column gap-3 h-100">
                    {/* Insight 1: Preferred Era */}
                    <div className="glass-card p-4 flex-grow-1">
                      <div className="d-flex align-items-center gap-3 mb-2">
                        <div
                          className="rounded-3 d-flex align-items-center justify-content-center p-3 text-warning"
                          style={{ background: 'rgba(234, 179, 8, 0.15)' }}
                        >
                          <i className="bi bi-clock-history fs-3"></i>
                        </div>
                        <div>
                          <span className="text-secondary small text-uppercase fw-semibold">Release Era</span>
                          <h5 className="fw-bold text-white mb-0">
                            {dna.insights?.preferredEra ? `${dna.insights.preferredEra} Cinema` : 'Diverse Decades'}
                          </h5>
                        </div>
                      </div>
                      <p className="text-secondary small mb-0 mt-3">
                        {dna.insights?.preferredEra
                          ? `You gravitate toward productions released during the ${dna.insights.preferredEra}.`
                          : 'Explore more eras to uncover time-period tendencies.'}
                      </p>
                    </div>

                    {/* Insight 2: Typical Runtime */}
                    <div className="glass-card p-4 flex-grow-1">
                      <div className="d-flex align-items-center gap-3 mb-2">
                        <div
                          className="rounded-3 d-flex align-items-center justify-content-center p-3 text-info"
                          style={{ background: 'rgba(6, 182, 212, 0.15)' }}
                        >
                          <i className="bi bi-hourglass-split fs-3"></i>
                        </div>
                        <div>
                          <span className="text-secondary small text-uppercase fw-semibold">Runtime Pace</span>
                          <h5 className="fw-bold text-white mb-0">
                            {dna.insights?.typicalRuntime || 'Flexible Duration'}
                          </h5>
                        </div>
                      </div>
                      <p className="text-secondary small mb-0 mt-3">
                        {dna.insights?.typicalRuntime
                          ? `Your typical viewing length averages around ${dna.insights.typicalRuntime}.`
                          : 'Runtime averages will calibrate as you log more film viewings.'}
                      </p>
                    </div>

                    {/* Insight 3: Dominant Language */}
                    <div className="glass-card p-4 flex-grow-1">
                      <div className="d-flex align-items-center gap-3 mb-2">
                        <div
                          className="rounded-3 d-flex align-items-center justify-content-center p-3 text-success"
                          style={{ background: 'rgba(34, 197, 94, 0.15)' }}
                        >
                          <i className="bi bi-translate fs-3"></i>
                        </div>
                        <div>
                          <span className="text-secondary small text-uppercase fw-semibold">Primary Language</span>
                          <h5 className="fw-bold text-white mb-0">
                            {dna.insights?.dominantLanguage || 'International'}
                          </h5>
                        </div>
                      </div>
                      <p className="text-secondary small mb-0 mt-3">
                        {dna.insights?.dominantLanguage
                          ? `Most frequently experienced storytelling is in ${dna.insights.dominantLanguage}.`
                          : 'Discover world cinema across various global regions.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Call to Recommendations */}
              <div className="glass-card p-4 p-md-5 text-center position-relative">
                <h4 className="fw-bold text-white mb-2">Ready to Discover Films Matching Your DNA?</h4>
                <p className="text-secondary small mb-4 mx-auto" style={{ maxWidth: '520px' }}>
                  Our personalized engine uses these exact genre preferences to surface cinematic gems tailored for you.
                </p>
                <div className="d-flex align-items-center justify-content-center gap-3 flex-wrap">
                  <a href="#/recommendations" className="btn btn-cv-primary px-4 py-2 d-inline-flex align-items-center gap-2">
                    <i className="bi bi-stars"></i> View Recommended For You
                  </a>
                  <a href="#/discover" className="btn btn-cv-outline px-4 py-2 d-inline-flex align-items-center gap-2">
                    <i className="bi bi-compass"></i> Explore All Films
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
