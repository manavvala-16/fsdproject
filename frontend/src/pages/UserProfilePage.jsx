import React, { useState, useEffect } from 'react';
import { fetchPublicUserProfile, followUser, unfollowUser } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const UserProfilePage = ({ userId }) => {
  const { isAuthenticated, user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [activeTab, setActiveTab] = useState('collections'); // 'collections' | 'activity'

  const loadProfile = async () => {
    setLoading(true);
    setErrorMsg(null);
    const res = await fetchPublicUserProfile(userId);
    if (res.success && res.data) {
      setProfile(res.data);
    } else {
      setErrorMsg(res.message || 'Unable to load member profile.');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const handleFollowToggle = async () => {
    if (!isAuthenticated) {
      window.location.hash = '#/login';
      return;
    }
    if (!profile) return;

    setActionLoading(true);
    if (profile.isFollowing) {
      const res = await unfollowUser(userId);
      if (res.success) {
        setProfile(prev => ({
          ...prev,
          isFollowing: false,
          followersCount: Math.max(0, prev.followersCount - 1)
        }));
      }
    } else {
      const res = await followUser(userId);
      if (res.success) {
        setProfile(prev => ({
          ...prev,
          isFollowing: true,
          followersCount: prev.followersCount + 1
        }));
      }
    }
    setActionLoading(false);
  };

  if (loading) {
    return (
      <div className="d-flex flex-column min-vh-100">
        <Navbar />
        <main className="flex-grow-1 d-flex align-items-center justify-content-center py-5">
          <LoadingSpinner message="Loading member profile..." />
        </main>
        <Footer />
      </div>
    );
  }

  if (errorMsg || !profile) {
    return (
      <div className="d-flex flex-column min-vh-100">
        <Navbar />
        <main className="flex-grow-1 py-5">
          <div className="container">
            <EmptyState
              icon="bi-person-x"
              title="Member Not Found"
              subtitle={errorMsg || "The member profile you are looking for does not exist or has been removed."}
              actionLabel="Explore Community"
              actionHref="#/community"
            />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const isSelf = currentUser && currentUser.id === profile.id;

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />

      <main className="flex-grow-1 py-5">
        <div className="container">
          {/* Breadcrumb / Back Link */}
          <div className="mb-4">
            <a href="#/community" className="text-secondary text-decoration-none small d-inline-flex align-items-center gap-1 hover-purple">
              <i className="bi bi-arrow-left"></i> Back to Community
            </a>
          </div>

          {/* Member Profile Header Card */}
          <div className="glass-card p-4 p-md-5 mb-4">
            <div className="d-flex flex-column flex-md-row align-items-center gap-4 text-center text-md-start">
              {/* Avatar */}
              <div
                className="rounded-circle text-white d-flex align-items-center justify-content-center fw-semibold fs-2 flex-shrink-0"
                style={{
                  width: '80px',
                  height: '80px',
                  backgroundColor: 'var(--cv-purple)'
                }}
              >
                {profile.name?.charAt(0).toUpperCase() || 'U'}
              </div>

              {/* User Info */}
              <div className="flex-grow-1">
                <div className="d-flex align-items-center justify-content-center justify-content-md-start gap-2 mb-1 flex-wrap">
                  <h3 className="fw-semibold text-white mb-0">{profile.name}</h3>
                  {profile.role === 'admin' ? (
                    <span className="badge bg-warning text-dark px-2 py-0 small fw-medium" style={{ fontSize: '0.68rem' }}>STAFF</span>
                  ) : (
                    <span className="badge bg-purple-subtle text-purple-light px-2 py-0 small" style={{ fontSize: '0.68rem' }}>MEMBER</span>
                  )}
                </div>

                <p className="text-secondary small mb-3">
                  Member since {new Date(profile.createdAt || '2025-01-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </p>

                {/* Follower Stats */}
                <div className="d-flex align-items-center justify-content-center justify-content-md-start gap-4">
                  <div>
                    <span className="fw-semibold fs-5 text-white me-1">{profile.followersCount}</span>
                    <span className="text-secondary small">Followers</span>
                  </div>
                  <div style={{ height: '18px', width: '1px', backgroundColor: 'var(--cv-border-subtle)' }}></div>
                  <div>
                    <span className="fw-semibold fs-5 text-white me-1">{profile.followingCount}</span>
                    <span className="text-secondary small">Following</span>
                  </div>
                  <div style={{ height: '18px', width: '1px', backgroundColor: 'var(--cv-border-subtle)' }}></div>
                  <div>
                    <span className="fw-semibold fs-5 text-white me-1">{profile.collections?.length || 0}</span>
                    <span className="text-secondary small">Collections</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div>
                {isSelf ? (
                  <a href="#/profile" className="btn btn-cv-outline btn-sm px-3 py-1">
                    Manage Profile
                  </a>
                ) : (
                  <button
                    className={`btn btn-sm px-3 py-1 ${
                      profile.isFollowing ? 'btn-cv-outline' : 'btn-cv-primary'
                    }`}
                    onClick={handleFollowToggle}
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <span className="spinner-border spinner-border-sm" role="status"></span>
                    ) : profile.isFollowing ? (
                      'Following'
                    ) : (
                      'Follow'
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="d-flex align-items-center gap-3 mb-4" style={{ borderBottom: '1px solid var(--cv-border-subtle)' }}>
            <button
              className={`btn btn-link text-decoration-none px-3 py-2 small fw-medium position-relative ${
                activeTab === 'collections' ? 'text-white' : 'text-secondary'
              }`}
              onClick={() => setActiveTab('collections')}
              style={{
                borderBottom: activeTab === 'collections' ? '2px solid var(--cv-purple)' : '2px solid transparent',
                borderRadius: 0
              }}
            >
              Public Collections ({profile.collections?.length || 0})
            </button>
            <button
              className={`btn btn-link text-decoration-none px-3 py-2 small fw-medium position-relative ${
                activeTab === 'activity' ? 'text-white' : 'text-secondary'
              }`}
              onClick={() => setActiveTab('activity')}
              style={{
                borderBottom: activeTab === 'activity' ? '2px solid var(--cv-purple)' : '2px solid transparent',
                borderRadius: 0
              }}
            >
              Recent Activity ({profile.recentActivity?.length || 0})
            </button>
          </div>

          {/* TAB 1: Public Collections */}
          {activeTab === 'collections' && (
            <div>
              {!profile.collections || profile.collections.length === 0 ? (
                <EmptyState
                  icon="bi-folder2-open"
                  title="No Public Collections"
                  subtitle={`${profile.name} has not published any public collections yet.`}
                />
              ) : (
                <div className="row g-4">
                  {profile.collections.map(col => (
                    <div key={col.id} className="col-md-6 col-lg-4">
                      <div className="glass-card h-100 p-4 d-flex flex-column justify-content-between position-relative hover-scale">
                        <div>
                          <div className="d-flex align-items-center justify-content-between mb-3">
                            <span className="badge bg-purple-subtle text-purple-light border border-purple-subtle px-2 py-1 small">
                              <i className="bi bi-globe2 me-1"></i> Public
                            </span>
                            <span className="text-secondary small">
                              {col.movieCount} {col.movieCount === 1 ? 'film' : 'films'}
                            </span>
                          </div>

                          <h4 className="fw-bold text-white mb-2">{col.name}</h4>
                          <p className="text-secondary small mb-4" style={{ minHeight: '38px' }}>
                            {col.description || 'A curated film selection.'}
                          </p>

                          {/* Film Posters Preview */}
                          {col.movies && col.movies.length > 0 && (
                            <div className="d-flex align-items-center gap-2 mb-4 overflow-hidden">
                              {col.movies.map((m, idx) => (
                                <img
                                  key={idx}
                                  src={m.poster_url || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300'}
                                  alt={m.title}
                                  className="rounded shadow-sm"
                                  style={{ width: '48px', height: '68px', objectFit: 'cover' }}
                                />
                              ))}
                            </div>
                          )}
                        </div>

                        <a
                          href={`#/collections/${col.id}`}
                          className="btn btn-cv-outline w-100 py-2 d-flex align-items-center justify-content-center gap-2"
                        >
                          <span>Explore Collection</span>
                          <i className="bi bi-arrow-right"></i>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Recent Activity / Ratings */}
          {activeTab === 'activity' && (
            <div>
              {!profile.recentActivity || profile.recentActivity.length === 0 ? (
                <EmptyState
                  icon="bi-film"
                  title="No Recent Activity"
                  subtitle={`${profile.name} has not rated or reviewed films recently.`}
                />
              ) : (
                <div className="row g-3">
                  {profile.recentActivity.map((item, idx) => (
                    <div key={idx} className="col-md-6 col-lg-4">
                      <div
                        className="glass-card p-3 d-flex align-items-center gap-3 hover-scale cursor-pointer"
                        onClick={() => { window.location.hash = `#/movies/${item.movieId}`; }}
                        style={{ cursor: 'pointer' }}
                      >
                        <img
                          src={item.poster_url || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300'}
                          alt={item.title}
                          className="rounded shadow-sm flex-shrink-0"
                          style={{ width: '56px', height: '80px', objectFit: 'cover' }}
                        />
                        <div className="flex-grow-1 overflow-hidden">
                          <h6 className="fw-bold text-white mb-1 text-truncate">{item.title}</h6>
                          <div className="d-flex align-items-center gap-2 text-secondary small mb-2">
                            <span>{item.releaseYear}</span>
                          </div>
                          <div className="d-flex align-items-center gap-1 text-warning small">
                            <i className="bi bi-star-fill"></i>
                            <span className="fw-bold text-white">{item.rating}</span>
                            <span className="text-secondary" style={{ fontSize: '0.75rem' }}>/ 5</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
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

export default UserProfilePage;
