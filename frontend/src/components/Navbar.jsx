import React from 'react';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ currentPath = '' }) => {
  const { isAuthenticated, user, isAdmin, logout } = useAuth();

  return (
    <nav
      className="navbar navbar-expand-lg sticky-top navbar-dark py-3"
      style={{
        background: 'rgba(11, 9, 20, 0.94)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(138, 43, 226, 0.2)'
      }}
    >
      <div className="container">
        {/* Brand Logo */}
        <a className="navbar-brand d-flex align-items-center gap-2 fw-bold fs-3" href="#/">
          <div
            className="d-flex align-items-center justify-content-center rounded-3 p-2"
            style={{
              background: 'linear-gradient(135deg, #8a2be2 0%, #4c1d95 100%)',
              boxShadow: '0 0 15px rgba(138, 43, 226, 0.5)'
            }}
          >
            <i className="bi bi-film text-white fs-4"></i>
          </div>
          <span>Cine<span className="text-purple-gradient">Vault</span></span>
        </a>

        {/* Mobile Toggle */}
        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#cinevaultNavbar"
          aria-controls="cinevaultNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="cinevaultNavbar">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4 gap-lg-1">
            <li className="nav-item">
              <a className={`nav-link px-2 px-xl-3 fw-medium ${currentPath === '#/' ? 'text-purple-light fw-bold' : 'text-light'}`} href="#/">
                <i className="bi bi-house-door me-1"></i>Home
              </a>
            </li>
            <li className="nav-item">
              <a className={`nav-link px-2 px-xl-3 fw-medium ${currentPath === '#/discover' ? 'text-purple-light fw-bold' : 'text-light'}`} href="#/discover">
                <i className="bi bi-compass me-1"></i>Discover
              </a>
            </li>

            {isAuthenticated && (
              <>
                <li className="nav-item">
                  <a className={`nav-link px-2 px-xl-3 fw-medium ${currentPath === '#/recommendations' ? 'text-purple-light fw-bold' : 'text-light'}`} href="#/recommendations">
                    <i className="bi bi-stars me-1 text-warning"></i>For You
                  </a>
                </li>
                <li className="nav-item">
                  <a className={`nav-link px-2 px-xl-3 fw-medium ${currentPath === '#/dna' ? 'text-purple-light fw-bold' : 'text-light'}`} href="#/dna">
                    <i className="bi bi-fingerprint me-1 text-purple-light"></i>DNA
                  </a>
                </li>
                <li className="nav-item">
                  <a className={`nav-link px-2 px-xl-3 fw-medium ${currentPath === '#/watchlist' ? 'text-purple-light fw-bold' : 'text-light'}`} href="#/watchlist">
                    <i className="bi bi-bookmark-heart me-1"></i>Watchlist
                  </a>
                </li>
                <li className="nav-item">
                  <a className={`nav-link px-2 px-xl-3 fw-medium ${currentPath === '#/collections' ? 'text-purple-light fw-bold' : 'text-light'}`} href="#/collections">
                    <i className="bi bi-collection-play me-1"></i>Collections
                  </a>
                </li>
              </>
            )}

            <li className="nav-item">
              <a className={`nav-link px-2 px-xl-3 fw-medium ${currentPath === '#/community' ? 'text-purple-light fw-bold' : 'text-light'}`} href="#/community">
                <i className="bi bi-people me-1"></i>Community
              </a>
            </li>
          </ul>

          <div className="d-flex align-items-center gap-2">
            {isAuthenticated ? (
              <div className="dropdown">
                <button
                  className="btn btn-cv-outline dropdown-toggle d-flex align-items-center gap-2 py-2 px-3"
                  type="button"
                  id="userMenuDropdown"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <div
                    className="rounded-circle text-white d-flex align-items-center justify-content-center fw-bold"
                    style={{
                      width: '28px', height: '28px', fontSize: '0.85rem',
                      background: 'linear-gradient(135deg, #8a2be2, #4c1d95)'
                    }}
                  >
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="d-none d-md-inline">{user?.name}</span>
                  {isAdmin && (
                    <span className="badge bg-warning text-dark ms-1" style={{ fontSize: '0.6rem' }}>ADMIN</span>
                  )}
                </button>
                <ul
                  className="dropdown-menu dropdown-menu-end dropdown-menu-dark p-2 border-secondary shadow-lg"
                  style={{ background: 'rgba(22, 18, 36, 0.97)', backdropFilter: 'blur(16px)', borderRadius: '12px', minWidth: '220px' }}
                  aria-labelledby="userMenuDropdown"
                >
                  <li>
                    <a className="dropdown-item rounded py-2 d-flex align-items-center gap-2" href="#/profile">
                      <i className="bi bi-person-circle text-purple-light"></i> Profile & Account
                    </a>
                  </li>
                  <li>
                    <a className="dropdown-item rounded py-2 d-flex align-items-center gap-2" href="#/dna">
                      <i className="bi bi-fingerprint text-purple-light"></i> Your Movie DNA
                    </a>
                  </li>
                  <li>
                    <a className="dropdown-item rounded py-2 d-flex align-items-center gap-2" href="#/recommendations">
                      <i className="bi bi-stars text-warning"></i> Recommended For You
                    </a>
                  </li>
                  <li>
                    <a className="dropdown-item rounded py-2 d-flex align-items-center gap-2" href="#/collections">
                      <i className="bi bi-collection-play text-purple-light"></i> My Collections
                    </a>
                  </li>
                  <li>
                    <a className="dropdown-item rounded py-2 d-flex align-items-center gap-2" href="#/watchlist">
                      <i className="bi bi-bookmark-heart text-purple-light"></i> My Watchlist
                    </a>
                  </li>
                  <li>
                    <a className="dropdown-item rounded py-2 d-flex align-items-center gap-2" href="#/history">
                      <i className="bi bi-clock-history text-purple-light"></i> Viewing History
                    </a>
                  </li>
                  {isAdmin && (
                    <>
                      <li><hr className="dropdown-divider border-secondary" /></li>
                      <li>
                        <a className="dropdown-item rounded py-2 d-flex align-items-center gap-2 text-warning" href="#/admin">
                          <i className="bi bi-shield-lock text-warning"></i> Admin Dashboard
                        </a>
                      </li>
                    </>
                  )}
                  <li><hr className="dropdown-divider border-secondary" /></li>
                  <li>
                    <button className="dropdown-item rounded py-2 d-flex align-items-center gap-2 text-danger" onClick={logout}>
                      <i className="bi bi-box-arrow-right"></i> Sign Out
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <div className="d-flex align-items-center gap-2">
                <a href="#/login" className="btn btn-cv-outline py-2 px-3">Log In</a>
                <a href="#/register" className="btn btn-cv-primary py-2 px-3">Register</a>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
