import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const LoginPage = () => {
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!formData.email || !formData.password) {
      setError('Please fill in both email and password.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await login(formData);
      if (response.success) {
        setSuccessMsg('Login successful! Redirecting...');
        setTimeout(() => {
          window.location.hash = '#/';
        }, 1000);
      } else {
        setError(response.message || 'Invalid credentials. Please try again.');
      }
    } catch (err) {
      setError('An unexpected network error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100 bg-dark text-light">
      <Navbar currentPath="#/login" />

      <main className="flex-grow-1 d-flex align-items-center justify-content-center py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-7 col-lg-5">
              <div className="glass-card p-4 p-sm-5 position-relative">
                {/* Header */}
                <div className="text-center mb-4">
                  <div className="d-inline-flex align-items-center justify-content-center rounded-circle p-3 mb-3" style={{ background: 'linear-gradient(135deg, #8a2be2 0%, #4c1d95 100%)', boxShadow: '0 0 20px rgba(138, 43, 226, 0.4)', width: '64px', height: '64px' }}>
                    <i className="bi bi-box-arrow-in-right text-white fs-3"></i>
                  </div>
                  <h3 className="fw-bold text-white mb-1">Welcome Back</h3>
                  <p className="text-secondary small">Log in to your CineVault account</p>
                </div>

                {/* Feedback Alerts */}
                {error && (
                  <div className="alert alert-danger border-danger-subtle bg-danger-subtle text-danger d-flex align-items-center gap-2 py-2 px-3 rounded-3 small mb-4">
                    <i className="bi bi-exclamation-triangle-fill"></i>
                    <span>{error}</span>
                  </div>
                )}

                {successMsg && (
                  <div className="alert alert-success border-success-subtle bg-success-subtle text-success d-flex align-items-center gap-2 py-2 px-3 rounded-3 small mb-4">
                    <i className="bi bi-check-circle-fill"></i>
                    <span>{successMsg}</span>
                  </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label text-secondary small fw-semibold">Email Address</label>
                    <div className="input-group">
                      <span className="input-group-text bg-dark border-secondary border-opacity-50 text-secondary">
                        <i className="bi bi-envelope"></i>
                      </span>
                      <input
                        type="email"
                        name="email"
                        className="form-control bg-dark text-light border-secondary border-opacity-50"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={isSubmitting}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <label className="form-label text-secondary small fw-semibold mb-0">Password</label>
                    </div>
                    <div className="input-group">
                      <span className="input-group-text bg-dark border-secondary border-opacity-50 text-secondary">
                        <i className="bi bi-key"></i>
                      </span>
                      <input
                        type="password"
                        name="password"
                        className="form-control bg-dark text-light border-secondary border-opacity-50"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                        disabled={isSubmitting}
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-cv-primary w-100 py-2 d-flex align-items-center justify-content-center gap-2 fw-semibold"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        <span>Authenticating...</span>
                      </>
                    ) : (
                      <>
                        <i className="bi bi-box-arrow-in-right"></i>
                        <span>Sign In</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Footer Link */}
                <div className="text-center mt-4 pt-3 border-top border-secondary border-opacity-25">
                  <span className="text-secondary small">Don't have a CineVault account? </span>
                  <a href="#/register" className="text-purple-light fw-bold text-decoration-none small hover-underline">
                    Create Account
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LoginPage;
