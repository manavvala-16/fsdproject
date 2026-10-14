import React, { useState, useEffect } from 'react';
import { fetchCommunityExplore, followUser, unfollowUser } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const CommunityPage = () => {
  const { isAuthenticated, user: currentUser } = useAuth();
  const [data, setData] = useState({ members: [], collections: [] });
  const [loading, setLoading] = useState(true);
  const [followLoadingId, setFollowLoadingId] = useState(null);

  const loadData = async () => {
    setLoading(false);
    const res = await fetchCommunityExplore();
    if (res.success && res.data) {
      setData(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFollowToggle = async (targetUserId, currentlyFollowing) => {
    if (!isAuthenticated) {
      window.location.hash = '#/login';
      return;
    }

    setFollowLoadingId(targetUserId);

    if (currentlyFollowing) {
      const res = await unfollowUser(targetUserId);
      if (res.success) {
        setData(prev => ({
          ...prev,
          members: prev.members.map(m =>
            m.id === targetUserId
              ? { ...m, isFollowing: false, followersCount: Math.max(0, m.followersCount - 1) }
              : m
          )
        }));
      }
    } else {
      const res = await followUser(targetUserId);
      if (res.success) {
        setData(prev => ({
          ...prev,
          members: prev.members.map(m =>
            m.id === targetUserId
              ? { ...m, isFollowing: true, followersCount: m.followersCount + 1 }
              : m
          )
        }));
      }
    }

    setFollowLoadingId(null);
  };

  return (
    <div className="d-flex flex-column min-vh-100 bg-dark text-light">
      <Navbar currentPath="#/community" />

      <main className="flex-grow-1 py-5">
        <div className="container">
          {/* Header */}
          <div className="text-center mb-5">
            <div
              className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill mb-3"
              style={{ background: 'rgba(138, 43, 226, 0.15)', border: '1px solid rgba(138, 43, 226, 0.4)' }}
            >
              <i className="bi bi-people-fill text-purple-light"></i>
              <span className="small fw-semibold text-purple-light">CineVault Community</span>
            </div>
            <h1 className="display-5 fw-bold text-white mb-3">Connect With Fellow Cinephiles</h1>
            <p className="text-secondary lead mx-auto" style={{ maxWidth: '640px' }}>
              Explore hand-crafted film collections, discover fellow film enthusiasts, and draw inspiration from what the community is watching.
            </p>
          </div>

          {loading ? (
            <LoadingSpinner message="Discovering CineVault community..." />
          ) : (
            <>
              {/* SECTION 1: Suggested Members */}
              <section className="mb-5">
                <div className="d-flex align-items-center justify-content-between mb-4 pb-2 border-bottom border-secondary border-opacity-25">
                  <div>
                    <h3 className="fw-bold text-white mb-1">
                      <i className="bi bi-person-stars text-purple-light me-2"></i>Curators & Film Enthusiasts
                    </h3>
                    <p className="text-secondary small mb-0">Follow other members to discover movies through their taste</p>
                  </div>
                </div>

                {data.members.length === 0 ? (
                  <EmptyState
                    icon="bi-people"
                    title="No Curators Found"
                    subtitle="Be the first to invite friends to CineVault and grow the film community."
                  />
                ) : (
                  <div className="row g-4">
                    {data.members.map(member => (
                      <div key={member.id} className="col-md-6 col-lg-3">
                        <div className="glass-card p-4 text-center h-100 d-flex flex-column justify-content-between hover-scale">
                          <div>
                            {/* Avatar */}
                            <a
                              href={`#/users/${member.id}`}
                              className="text-decoration-none d-inline-block mb-3"
                            >
                              <div
                                className="rounded-circle bg-purple-gradient text-white d-inline-flex align-items-center justify-content-center fw-bold fs-3 shadow"
                                style={{
                                  width: '72px',
                                  height: '72px',
                                  border: '2px solid rgba(168, 85, 247, 0.5)'
                                }}
                              >
                                {member.name?.charAt(0).toUpperCase() || 'U'}
                              </div>
                            </a>

                            {/* Name & Badge */}
                            <h5 className="fw-bold text-white mb-1 text-truncate">
                              <a href={`#/users/${member.id}`} className="text-white text-decoration-none hover-purple">
                                {member.name}
                              </a>
                            </h5>

                            <div className="mb-3">
                              {member.role === 'admin' ? (
                                <span className="badge bg-warning text-dark px-2 py-0 small fw-bold">STAFF</span>
                              ) : (
                                <span className="badge bg-purple-subtle text-purple-light border border-purple-subtle px-2 py-0 small">CURATOR</span>
                              )}
                            </div>

                            {/* Stats */}
                            <div className="d-flex align-items-center justify-content-center gap-3 text-secondary small mb-4">
                              <div>
                                <span className="fw-bold text-white">{member.followersCount}</span> followers
                              </div>
                              <span>•</span>
                              <div>
                                <span className="fw-bold text-white">{member.publicCollectionsCount}</span> collections
                              </div>
                            </div>
                          </div>

                          {/* Follow Button */}
                          <div>
                            <button
                              className={`btn w-100 py-2 btn-sm fw-semibold d-flex align-items-center justify-content-center gap-1 ${
                                member.isFollowing ? 'btn-outline-secondary text-light' : 'btn-cv-primary'
                              }`}
                              onClick={() => handleFollowToggle(member.id, member.isFollowing)}
                              disabled={followLoadingId === member.id}
                            >
                              {followLoadingId === member.id ? (
                                <span className="spinner-border spinner-border-sm" role="status"></span>
                              ) : member.isFollowing ? (
                                <>
                                  <i className="bi bi-person-check-fill text-purple-light"></i> Following
                                </>
                              ) : (
                                <>
                                  <i className="bi bi-person-plus-fill"></i> Follow
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* SECTION 2: Popular & Recent Public Collections */}
              <section className="pt-3">
                <div className="d-flex align-items-center justify-content-between mb-4 pb-2 border-bottom border-secondary border-opacity-25">
                  <div>
                    <h3 className="fw-bold text-white mb-1">
                      <i className="bi bi-collection-play-fill text-warning me-2"></i>Community Collections
                    </h3>
                    <p className="text-secondary small mb-0">Themed movie collections shared publicly by CineVault members</p>
                  </div>
                </div>

                {data.collections.length === 0 ? (
                  <EmptyState
                    icon="bi-collection-play"
                    title="No Public Collections Yet"
                    subtitle="Create your own collection and make it public to inspire other cinephiles."
                    actionLabel="Create Collection"
                    actionHref="#/collections"
                  />
                ) : (
                  <div className="row g-4">
                    {data.collections.map(col => (
                      <div key={col.id} className="col-md-6 col-lg-4">
                        <div className="glass-card h-100 p-4 d-flex flex-column justify-content-between position-relative hover-scale">
                          <div>
                            <div className="d-flex align-items-center justify-content-between mb-3">
                              <a
                                href={`#/users/${col.userId}`}
                                className="text-decoration-none small text-secondary d-flex align-items-center gap-2 hover-purple"
                              >
                                <div
                                  className="rounded-circle bg-purple-gradient text-white d-flex align-items-center justify-content-center fw-bold"
                                  style={{ width: '24px', height: '24px', fontSize: '0.75rem' }}
                                >
                                  {col.ownerName?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <span className="text-light fw-medium">{col.ownerName}</span>
                              </a>
                              <span className="badge bg-dark border border-secondary text-secondary small">
                                {col.movieCount} {col.movieCount === 1 ? 'film' : 'films'}
                              </span>
                            </div>

                            <h4 className="fw-bold text-white mb-2">{col.name}</h4>
                            <p className="text-secondary small mb-4" style={{ minHeight: '38px' }}>
                              {col.description || 'Curated film collection by community member.'}
                            </p>

                            {/* Movie Posters Preview */}
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
              </section>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CommunityPage;
