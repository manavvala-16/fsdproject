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
    <div className="d-flex flex-column min-vh-100 bg-dark text-light">
      <Navbar currentPath="#/profile" />

      <main className="flex-grow-1 py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10">
              {/* Profile Card */}
              <div className="glass-card p-4 p-md-5 mb-4 position-relative overflow-hidden">
                <div
                  className="position-absolute"
                  style={{
                    top: '-40%',
                    right: '-10%',
                    width: '320px',
                    height: '320px',
                    background: 'radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, rgba(0,0,0,0) 70%)',
                    pointerEvents: 'none'
                  }}
                />

                <div className="d-flex flex-column flex-md-row align-items-center gap-4 text-center text-md-start">
                  <div
                    className="rounded-circle bg-purple-gradient text-white d-flex align-items-center justify-content-center fw-bold fs-1 shadow-lg flex-shrink-0"
                    style={{ width: '96px', height: '96px', border: '3px solid rgba(168, 85, 247, 0.5)' }}
                  >
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>

                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center justify-content-center justify-content-md-start gap-2 mb-1 flex-wrap">
                      <h2 className="fw-bold text-white mb-0">{user?.name}</h2>
                      {isAdmin ? (
                        <span className="badge bg-warning text-dark px-2 py-1 small fw-bold">ADMINISTRATOR</span>
                      ) : (
                        <span className="badge bg-purple-subtle text-purple-light border border-purple-subtle px-2 py-1 small">CINEPHILE MEMBER</span>
                      )}
                    </div>
                    <p className="text-secondary mb-3">{user?.email}</p>

                    {/* Social Counters */}
                    <div className="d-flex align-items-center justify-content-center justify-content-md-start gap-4">
                      <div>
                        <span className="fw-bold fs-5 text-white me-1">{socialStats.followersCount}</span>
                        <span className="text-secondary small">Followers</span>
                      </div>
                      <div className="border-start border-secondary opacity-25" style={{ height: '24px' }}></div>
                      <div>
                        <span className="fw-bold fs-5 text-white me-1">{socialStats.followingCount}</span>
                        <span className="text-secondary small">Following</span>
                      </div>
                      <div className="border-start border-secondary opacity-25" style={{ height: '24px' }}></div>
                      <div>
                        <span className="fw-bold fs-5 text-purple-light me-1">{collections.length}</span>
                        <span className="text-secondary small">Total Collections</span>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex flex-column gap-2">
                    <a href={`#/users/${user?.id}`} className="btn btn-cv-outline py-2 px-3 d-flex align-items-center justify-content-center gap-2">
                      <i className="bi bi-eye"></i> View Public Profile
                    </a>
                    <button className="btn btn-outline-danger py-2 px-3 d-flex align-items-center justify-content-center gap-2" onClick={logout}>
                      <i className="bi bi-box-arrow-right"></i> Sign Out
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Navigation Cards */}
              <div className="row g-3 mb-5">
                <div className="col-sm-6 col-lg-3">
                  <a href="#/dna" className="glass-card p-3 text-center text-decoration-none d-block hover-scale">
                    <div className="text-purple-light fs-3 mb-1">
                      <i className="bi bi-fingerprint"></i>
                    </div>
                    <h5 className="fw-bold text-white mb-1">Movie DNA</h5>
                    <span className="small text-secondary">View Taste Profile</span>
                  </a>
                </div>
                <div className="col-sm-6 col-lg-3">
                  <a href="#/recommendations" className="glass-card p-3 text-center text-decoration-none d-block hover-scale">
                    <div className="text-warning fs-3 mb-1">
                      <i className="bi bi-stars"></i>
                    </div>
                    <h5 className="fw-bold text-white mb-1">Recommended</h5>
                    <span className="small text-secondary">Personalized Films</span>
                  </a>
                </div>
                <div className="col-sm-6 col-lg-3">
                  <a href="#/watchlist" className="glass-card p-3 text-center text-decoration-none d-block hover-scale">
                    <div className="text-info fs-3 mb-1">
                      <i className="bi bi-bookmark-heart"></i>
                    </div>
                    <h5 className="fw-bold text-white mb-1">Watchlist</h5>
                    <span className="small text-secondary">Saved Cinema</span>
                  </a>
                </div>
                <div className="col-sm-6 col-lg-3">
                  <a href="#/history" className="glass-card p-3 text-center text-decoration-none d-block hover-scale">
                    <div className="text-success fs-3 mb-1">
                      <i className="bi bi-clock-history"></i>
                    </div>
                    <h5 className="fw-bold text-white mb-1">History</h5>
                    <span className="small text-secondary">Logged Films</span>
                  </a>
                </div>
              </div>

              {/* My Public Collections Section */}
              <div className="glass-card p-4 p-md-5">
                <div className="d-flex align-items-center justify-content-between mb-4 pb-2 border-bottom border-secondary border-opacity-25 flex-wrap gap-2">
                  <div>
                    <h4 className="fw-bold text-white mb-1">
                      <i className="bi bi-collection-play-fill text-purple-light me-2"></i>My Public Collections
                    </h4>
                    <p className="text-secondary small mb-0">Collections visible to other CineVault community members</p>
                  </div>
                  <a href="#/collections" className="btn btn-cv-primary btn-sm px-3 py-2 d-inline-flex align-items-center gap-2">
                    <i className="bi bi-folder-plus"></i> Manage All Collections
                  </a>
                </div>

                {publicCollections.length === 0 ? (
                  <div className="text-center py-4 text-secondary">
                    <p className="mb-2">You don't have any public collections yet.</p>
                    <a href="#/collections" className="text-purple-light small fw-semibold text-decoration-none">
                      Go to My Collections to create one or set existing ones to Public →
                    </a>
                  </div>
                ) : (
                  <div className="row g-3">
                    {publicCollections.map(col => (
                      <div key={col.id} className="col-md-6">
                        <div className="glass-card p-3 d-flex align-items-center justify-content-between hover-scale">
                          <div>
                            <h6 className="fw-bold text-white mb-1">{col.name}</h6>
                            <span className="text-secondary small">
                              {col.movieCount || col.movies?.length || 0} films • <span className="text-success">Public</span>
                            </span>
                          </div>
                          <a href={`#/collections/${col.id}`} className="btn btn-cv-outline btn-sm px-3">
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
