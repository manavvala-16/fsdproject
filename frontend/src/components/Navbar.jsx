import React from 'react';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ currentPath = '' }) => {
  const { isAuthenticated, user, isAdmin, logout } = useAuth();

  return (
    <nav
      className="navbar navbar-expand-lg sticky-top navbar-dark py-2"
      style={{
        backgroundColor: 'rgba(13, 11, 20, 0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--cv-border-subtle)'
      }}
    >
      <div className="container">
        {/* Brand Logo */}
        <a className="navbar-brand d-flex align-items-center gap-2 fw-semibold fs-5" href="#/">
          <div
            className="d-flex align-items-center justify-content-center rounded-2"
            style={{
              width: '32px',
              height: '32px',
              backgroundColor: 'var(--cv-purple)'
            }}
          >
            <i className="bi bi-film text-white" style={{ fontSize: '1rem' }}></i>
          </div>
          <span>Cine<span style={{ color: 'var(--cv-purple-light)' }}>Vault</span></span>
        </a>

        {/* Mobile Toggle */}
        <button
          className="navbar-toggler border-0 p-1"
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
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-3 gap-lg-1">
            <li className="nav-item">
              <a className={`nav-link px-2 px-lg-3 small ${currentPath === '#/' ? 'text-white fw-semibold' : 'text-secondary'}`} href="#/">
                Home
              </a>
            </li>
            <li className="nav-item">
              <a className={`nav-link px-2 px-lg-3 small ${currentPath === '#/discover' ? 'text-white fw-semibold' : 'text-secondary'}`} href="#/discover">
                Discover
              </a>
            </li>

            {isAuthenticated && (
              <>
                <li className="nav-item">
                  <a className={`nav-link px-2 px-lg-3 small ${currentPath === '#/recommendations' ? 'text-white fw-semibold' : 'text-secondary'}`} href="#/recommendations">
                    For You
                  </a>
                </li>
                <li className="nav-item">
                  <a className={`nav-link px-2 px-lg-3 small ${currentPath === '#/dna' ? 'text-white fw-semibold' : 'text-secondary'}`} href="#/dna">
                    Movie DNA
                  </a>
                </li>
                <li className="nav-item">
                  <a className={`nav-link px-2 px-lg-3 small ${currentPath === '#/watchlist' ? 'text-white fw-semibold' : 'text-secondary'}`} href="#/watchlist">
                    Watchlist
                  </a>
                </li>
                <li className="nav-item">
                  <a className={`nav-link px-2 px-lg-3 small ${currentPath === '#/collections' ? 'text-white fw-semibold' : 'text-secondary'}`} href="#/collections">
                    Collections
                  </a>
                </li>
              </>
            )}

            <li className="nav-item">
              <a className={`nav-link px-2 px-lg-3 small ${currentPath === '#/community' ? 'text-white fw-semibold' : 'text-secondary'}`} href="#/community">
                Community
              </a>
            </li>
          </ul>

          <div className="d-flex align-items-center gap-2">
            {isAuthenticated ? (
              <div className="dropdown">
                <button
                  className="btn btn-cv-outline dropdown-toggle d-flex align-items-center gap-2 py-1 px-3 small"
                  type="button"
                  id="userMenuDropdown"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <div
                    className="rounded-circle text-white d-flex align-items-center justify-content-center fw-semibold"
                    style={{
                      width: '24px', height: '24px', fontSize: '0.75rem',
                      backgroundColor: 'var(--cv-purple)'
                    }}
                  >
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="d-none d-md-inline small">{user?.name}</span>
                  {isAdmin && (
                    <span className="badge bg-warning text-dark ms-1" style={{ fontSize: '0.65rem' }}>Admin</span>
                  )}
                </button>
                <ul
                  className="dropdown-menu dropdown-menu-end dropdown-menu-dark p-2"
                  style={{ minWidth: '200px' }}
                  aria-labelledby="userMenuDropdown"
                >
                  <li>
                    <a className="dropdown-item d-flex align-items-center gap-2" href="#/profile">
                      <i className="bi bi-person text-secondary"></i> Profile
                    </a>
                  </li>
                  <li>
                    <a className="dropdown-item d-flex align-items-center gap-2" href="#/dna">
                      <i className="bi bi-fingerprint text-secondary"></i> Movie DNA
                    </a>
                  </li>
                  <li>
                    <a className="dropdown-item d-flex align-items-center gap-2" href="#/recommendations">
                      <i className="bi bi-stars text-secondary"></i> Recommendations
                    </a>
                  </li>
                  <li>
                    <a className="dropdown-item d-flex align-items-center gap-2" href="#/collections">
                      <i className="bi bi-collection text-secondary"></i> Collections
                    </a>
                  </li>
                  <li>
                    <a className="dropdown-item d-flex align-items-center gap-2" href="#/watchlist">
                      <i className="bi bi-bookmark text-secondary"></i> Watchlist
                    </a>
                  </li>
                  <li>
                    <a className="dropdown-item d-flex align-items-center gap-2" href="#/history">
                      <i className="bi bi-clock-history text-secondary"></i> Watch History
                    </a>
                  </li>
                  {isAdmin && (
                    <>
                      <li><hr className="dropdown-divider my-1 border-secondary border-opacity-25" /></li>
                      <li>
                        <a className="dropdown-item d-flex align-items-center gap-2 text-warning" href="#/admin">
                          <i className="bi bi-shield text-warning"></i> Admin Panel
                        </a>
                      </li>
                    </>
                  )}
                  <li><hr className="dropdown-divider my-1 border-secondary border-opacity-25" /></li>
                  <li>
                    <button className="dropdown-item d-flex align-items-center gap-2 text-danger" onClick={logout}>
                      <i className="bi bi-box-arrow-right"></i> Sign Out
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <div className="d-flex align-items-center gap-2">
                <a href="#/login" className="btn btn-cv-outline py-1 px-3 small">Sign In</a>
                <a href="#/register" className="btn btn-cv-primary py-1 px-3 small">Register</a>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
