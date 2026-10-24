import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchFollowStatus, fetchCollections } from '../services/api';
import ProtectedRoute from '../components/ProtectedRoute';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const ProfilePageContent = () => {
  const { user, logout, isAdmin } = useAuth();
  const [socialStats, setSocialStats] = useState({ followersCount: 0, followingCount: 0 });
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfileData = async () => {
      if (user?.id) {
        const [statRes, colRes] = await Promise.all([
          fetchFollowStatus(user.id),
          fetchCollections()
        ]);
        if (statRes.success && statRes.data) {
          setSocialStats({
            followersCount: statRes.data.followersCount,
            followingCount: statRes.data.followingCount
          });
        }
        if (colRes.success && colRes.data) {
          setCollections(colRes.data);
        }
      }
      setLoading(false);
    };
    loadProfileData();
  }, [user]);

  const publicCollections = collections.filter(c => c.isPublic);

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar currentPath="#/profile" />

      <main className="flex-grow-1 py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10">
              {/* Profile Card */}
              <div className="glass-card p-4 p-md-5 mb-4">
                <div className="d-flex flex-column flex-md-row align-items-center gap-4 text-center text-md-start">
                  <div
                    className="rounded-circle text-white d-flex align-items-center justify-content-center fw-semibold fs-2 flex-shrink-0"
                    style={{ width: '80px', height: '80px', backgroundColor: 'var(--cv-purple)' }}
                  >
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>

                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center justify-content-center justify-content-md-start gap-2 mb-1 flex-wrap">
                      <h3 className="fw-semibold text-white mb-0">{user?.name}</h3>
                      {isAdmin ? (
                        <span className="badge bg-warning text-dark px-2 py-0 small fw-medium" style={{ fontSize: '0.68rem' }}>ADMIN</span>
                      ) : (
                        <span className="badge bg-purple-subtle text-purple-light px-2 py-0 small" style={{ fontSize: '0.68rem' }}>MEMBER</span>
                      )}
                    </div>
                    <p className="text-secondary small mb-3">{user?.email}</p>

                    {/* Social Counters */}
                    <div className="d-flex align-items-center justify-content-center justify-content-md-start gap-4">
                      <div>
                        <span className="fw-semibold fs-5 text-white me-1">{socialStats.followersCount}</span>
                        <span className="text-secondary small">Followers</span>
                      </div>
                      <div style={{ height: '18px', width: '1px', backgroundColor: 'var(--cv-border-subtle)' }}></div>
                      <div>
                        <span className="fw-semibold fs-5 text-white me-1">{socialStats.followingCount}</span>
                        <span className="text-secondary small">Following</span>
                      </div>
                      <div style={{ height: '18px', width: '1px', backgroundColor: 'var(--cv-border-subtle)' }}></div>
                      <div>
                        <span className="fw-semibold fs-5 text-white me-1">{collections.length}</span>
                        <span className="text-secondary small">Collections</span>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex flex-column gap-2">
                    <a href={`#/users/${user?.id}`} className="btn btn-cv-outline btn-sm py-1 px-3">
                      Public View
                    </a>
                    <button className="btn btn-outline-danger btn-sm py-1 px-3" onClick={logout}>
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Navigation Cards */}
              <div className="row g-3 mb-4">
                <div className="col-6 col-md-3">
                  <a href="#/dna" className="glass-card cv-card-interactive p-3 text-center text-decoration-none d-block">
                    <h6 className="fw-semibold text-white mb-1">Movie DNA</h6>
                    <span className="small text-secondary" style={{ fontSize: '0.75rem' }}>Taste Profile</span>
                  </a>
                </div>
                <div className="col-6 col-md-3">
                  <a href="#/recommendations" className="glass-card cv-card-interactive p-3 text-center text-decoration-none d-block">
                    <h6 className="fw-semibold text-white mb-1">For You</h6>
                    <span className="small text-secondary" style={{ fontSize: '0.75rem' }}>Recommendations</span>
                  </a>
                </div>
                <div className="col-6 col-md-3">
                  <a href="#/watchlist" className="glass-card cv-card-interactive p-3 text-center text-decoration-none d-block">
                    <h6 className="fw-semibold text-white mb-1">Watchlist</h6>
                    <span className="small text-secondary" style={{ fontSize: '0.75rem' }}>Saved Cinema</span>
                  </a>
                </div>
                <div className="col-6 col-md-3">
                  <a href="#/history" className="glass-card cv-card-interactive p-3 text-center text-decoration-none d-block">
                    <h6 className="fw-semibold text-white mb-1">History</h6>
                    <span className="small text-secondary" style={{ fontSize: '0.75rem' }}>Logged Films</span>
                  </a>
                </div>
              </div>

              {/* My Public Collections Section */}
              <div className="glass-card p-4 p-md-4">
                <div className="d-flex align-items-center justify-content-between mb-3 pb-2 flex-wrap gap-2" style={{ borderBottom: '1px solid var(--cv-border-subtle)' }}>
                  <div>
                    <h5 className="fw-semibold text-white mb-0">My Public Collections</h5>
                    <p className="text-secondary small mb-0">Collections shared publicly with the CineVault community</p>
                  </div>
                  <a href="#/collections" className="btn btn-cv-outline btn-sm px-3 py-1">
                    Manage Collections
                  </a>
                </div>

                {publicCollections.length === 0 ? (
                  <div className="text-center py-4 text-secondary small">
                    <p className="mb-2">You don't have any public collections yet.</p>
                    <a href="#/collections" className="text-purple-light fw-medium text-decoration-none">
                      Go to collections to create or share one
                    </a>
                  </div>
                ) : (
                  <div className="row g-3">
                    {publicCollections.map(col => (
                      <div key={col.id} className="col-md-6">
                        <div className="glass-card cv-card-interactive p-3 d-flex align-items-center justify-content-between">
                          <div>
                            <h6 className="fw-semibold text-white mb-1">{col.name}</h6>
                            <span className="text-secondary small">
                              {col.movieCount || col.movies?.length || 0} films • Public
                            </span>
                          </div>
                          <a href={`#/collections/${col.id}`} className="btn btn-cv-outline btn-sm px-3 py-1">
                            View
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

const ProfilePage = () => (
  <ProtectedRoute>
    <ProfilePageContent />
  </ProtectedRoute>
);

export default ProfilePage;
