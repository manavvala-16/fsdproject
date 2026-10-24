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
    <div className="d-flex flex-column min-vh-100">
      <Navbar currentPath="#/community" />

      <main className="flex-grow-1 py-5">
        <div className="container">
          {/* Header */}
          <div className="text-center mb-5">
            <h2 className="fw-semibold text-white mb-2">Community</h2>
            <p className="text-secondary small mx-auto mb-0" style={{ maxWidth: '540px' }}>
              Explore hand-crafted film collections, discover fellow film enthusiasts, and share cinema inspiration.
            </p>
          </div>

          {loading ? (
            <LoadingSpinner message="Loading community..." />
          ) : (
            <>
              {/* SECTION 1: Suggested Members */}
              <section className="mb-5">
                <div className="d-flex align-items-center justify-content-between mb-3 pb-2" style={{ borderBottom: '1px solid var(--cv-border-subtle)' }}>
                  <div>
                    <h5 className="fw-semibold text-white mb-1">Curators & Members</h5>
                    <p className="text-secondary small mb-0">Follow other members to discover movies through their taste</p>
                  </div>
                </div>

                {data.members.length === 0 ? (
                  <EmptyState
                    icon="bi-people"
                    title="No curators found"
                    subtitle="Be the first to invite friends to CineVault and grow the film community."
                  />
                ) : (
                  <div className="row g-3 g-md-4">
                    {data.members.map(member => (
                      <div key={member.id} className="col-sm-6 col-lg-3">
                        <div className="glass-card cv-card-interactive p-4 text-center h-100 d-flex flex-column justify-content-between">
                          <div>
                            {/* Avatar */}
                            <a
                              href={`#/users/${member.id}`}
                              className="text-decoration-none d-inline-block mb-3"
                            >
                              <div
                                className="rounded-circle text-white d-inline-flex align-items-center justify-content-center fw-semibold fs-4"
                                style={{
                                  width: '56px',
                                  height: '56px',
                                  backgroundColor: 'var(--cv-purple)'
                                }}
                              >
                                {member.name?.charAt(0).toUpperCase() || 'U'}
                              </div>
                            </a>

                            {/* Name & Badge */}
                            <h6 className="fw-semibold text-white mb-1 text-truncate">
                              <a href={`#/users/${member.id}`} className="text-white text-decoration-none">
                                {member.name}
                              </a>
                            </h6>

                            <div className="mb-2">
                              {member.role === 'admin' ? (
                                <span className="badge bg-warning text-dark px-2 py-0 small fw-medium" style={{ fontSize: '0.68rem' }}>STAFF</span>
                              ) : (
                                <span className="badge bg-purple-subtle text-purple-light px-2 py-0 small" style={{ fontSize: '0.68rem' }}>MEMBER</span>
                              )}
                            </div>

                            {/* Stats */}
                            <div className="d-flex align-items-center justify-content-center gap-2 text-secondary small mb-3" style={{ fontSize: '0.78rem' }}>
                              <span>{member.followersCount} followers</span>
                              <span>•</span>
                              <span>{member.publicCollectionsCount} collections</span>
                            </div>
                          </div>

                          {/* Follow Button */}
                          <div>
                            <button
                              className={`btn w-100 py-1 btn-sm ${
                                member.isFollowing ? 'btn-cv-outline' : 'btn-cv-primary'
                              }`}
                              onClick={() => handleFollowToggle(member.id, member.isFollowing)}
                              disabled={followLoadingId === member.id}
                            >
                              {followLoadingId === member.id ? (
                                <span className="spinner-border spinner-border-sm" role="status"></span>
                              ) : member.isFollowing ? (
                                'Following'
                              ) : (
                                'Follow'
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
              <section className="pt-2">
                <div className="d-flex align-items-center justify-content-between mb-3 pb-2" style={{ borderBottom: '1px solid var(--cv-border-subtle)' }}>
                  <div>
                    <h5 className="fw-semibold text-white mb-1">Community Collections</h5>
                    <p className="text-secondary small mb-0">Themed movie shelves shared publicly by CineVault members</p>
                  </div>
                </div>

                {data.collections.length === 0 ? (
                  <EmptyState
                    icon="bi-collection-play"
                    title="No public collections yet"
                    subtitle="Create your own collection and make it public to share with the community."
                    actionLabel="Create Collection"
                    actionHref="#/collections"
                  />
                ) : (
                  <div className="row g-3 g-md-4">
                    {data.collections.map(col => (
                      <div key={col.id} className="col-md-6 col-lg-4">
                        <div className="glass-card cv-card-interactive h-100 p-4 d-flex flex-column justify-content-between position-relative">
                          <div>
                            <div className="d-flex align-items-center justify-content-between mb-3">
                              <a
                                href={`#/users/${col.userId}`}
                                className="text-decoration-none small text-secondary d-flex align-items-center gap-2"
                              >
                                <div
                                  className="rounded-circle text-white d-flex align-items-center justify-content-center fw-medium"
                                  style={{ width: '22px', height: '22px', fontSize: '0.7rem', backgroundColor: 'var(--cv-purple)' }}
                                >
                                  {col.ownerName?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <span className="text-secondary fw-medium">{col.ownerName}</span>
                              </a>
                              <span className="badge bg-purple-subtle text-purple-light small" style={{ fontSize: '0.7rem' }}>
                                {col.movieCount} {col.movieCount === 1 ? 'film' : 'films'}
                              </span>
                            </div>

                            <h5 className="fw-semibold text-white mb-1">{col.name}</h5>
                            <p className="text-secondary small mb-3" style={{ minHeight: '36px', lineHeight: '1.5' }}>
                              {col.description || 'Curated film collection by community member.'}
                            </p>

                            {/* Movie Posters Preview */}
                            {col.movies && col.movies.length > 0 && (
                              <div className="d-flex align-items-center gap-2 mb-3 overflow-hidden">
                                {col.movies.map((m, idx) => (
                                  <img
                                    key={idx}
                                    src={m.poster_url || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300'}
                                    alt={m.title}
                                    className="rounded-1"
                                    style={{ width: '48px', height: '68px', objectFit: 'cover', border: '1px solid var(--cv-border-subtle)' }}
                                  />
                                ))}
                              </div>
                            )}
                          </div>

                          <a
                            href={`#/collections/${col.id}`}
                            className="btn btn-cv-outline btn-sm w-100 py-1"
                          >
                            View Collection
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
