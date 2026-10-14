import React from 'react';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100 bg-dark text-light">
        <div className="text-center">
          <div className="spinner-border text-purple-light mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading session...</span>
          </div>
          <p className="text-secondary small">Verifying CineVault Session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login UI view if not logged in
    window.location.hash = '#/login';
    return (
      <div className="container py-5 text-center text-light">
        <div className="glass-card p-5 mx-auto" style={{ maxWidth: '500px' }}>
          <i className="bi bi-lock-fill text-purple-gradient display-1 mb-3"></i>
          <h3 className="fw-bold mb-3">Authentication Required</h3>
          <p className="text-secondary mb-4">Please log in to access your CineVault account features.</p>
          <a href="#/login" className="btn btn-cv-primary px-4 py-2">
            Log In Now
          </a>
        </div>
      </div>
    );
  }

  if (requiredRole && user?.role !== requiredRole) {
    return (
      <div className="container py-5 text-center text-light">
        <div className="glass-card p-5 mx-auto" style={{ maxWidth: '500px' }}>
          <i className="bi bi-shield-slash text-danger display-1 mb-3"></i>
          <h3 className="fw-bold mb-3">Access Denied</h3>
          <p className="text-secondary mb-4">You do not have administrative privileges to view this area.</p>
          <a href="#/" className="btn btn-cv-outline px-4 py-2">
            Return to Discovery
          </a>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
