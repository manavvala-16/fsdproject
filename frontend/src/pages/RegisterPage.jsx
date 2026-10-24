import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const RegisterPage = () => {
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
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

    // Field Validations
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all required fields.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await register(formData);
      if (response.success) {
        setSuccessMsg('Account created successfully! Welcome to CineVault.');
        setTimeout(() => {
          window.location.hash = '#/';
        }, 1200);
      } else {
        setError(response.message || 'Registration failed. Please try again.');
      }
    } catch {
      setError('An unexpected network error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100 bg-dark text-light">
      <Navbar currentPath="#/register" />

      <main className="flex-grow-1 d-flex align-items-center justify-content-center py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-7 col-lg-5">
              <div className="glass-card p-4 p-sm-5">
                {/* Header */}
                <div className="text-center mb-4">
                  <div
                    className="d-inline-flex align-items-center justify-content-center rounded-2 mb-3"
                    style={{
                      width: '40px',
                      height: '40px',
                      backgroundColor: 'var(--cv-purple)'
                    }}
                  >
                    <i className="bi bi-film text-white fs-5"></i>
                  </div>
                  <h4 className="fw-semibold text-white mb-1">Create Account</h4>
                  <p className="text-secondary small mb-0">Join CineVault to curate and discover films</p>
                </div>

                {/* Feedback Alerts */}
                {error && (
                  <div className="alert alert-danger border-danger-subtle bg-danger-subtle text-danger d-flex align-items-center gap-2 py-2 px-3 rounded-2 small mb-4">
                    <i className="bi bi-exclamation-triangle"></i>
                    <span>{error}</span>
                  </div>
                )}

                {successMsg && (
                  <div className="alert alert-success border-success-subtle bg-success-subtle text-success d-flex align-items-center gap-2 py-2 px-3 rounded-2 small mb-4">
                    <i className="bi bi-check-circle"></i>
                    <span>{successMsg}</span>
                  </div>
                )}

                {/* Registration Form */}
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label text-secondary small mb-1">Full Name</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="bi bi-person"></i>
                      </span>
                      <input
                        type="text"
                        name="name"
                        className="form-control"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={handleChange}
                        disabled={isSubmitting}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-secondary small mb-1">Email</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="bi bi-envelope"></i>
                      </span>
                      <input
                        type="email"
                        name="email"
                        className="form-control"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={isSubmitting}
                        required
                      />
                    </div>
                  </div>

                  <div className="row g-2 mb-4">
                    <div className="col-sm-6">
                      <label className="form-label text-secondary small mb-1">Password</label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <i className="bi bi-lock"></i>
                        </span>
                        <input
                          type="password"
                          name="password"
                          className="form-control"
                          placeholder="••••••••"
                          value={formData.password}
                          onChange={handleChange}
                          disabled={isSubmitting}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <label className="form-label text-secondary small mb-1">Confirm</label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <i className="bi bi-shield-check"></i>
                        </span>
                        <input
                          type="password"
                          name="confirmPassword"
                          className="form-control"
                          placeholder="••••••••"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          disabled={isSubmitting}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-cv-primary w-100 py-2 fw-medium"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        <span>Registering...</span>
                      </>
                    ) : (
                      <span>Create Account</span>
                    )}
                  </button>
                </form>

                {/* Footer Link */}
                <div className="text-center mt-4 pt-3" style={{ borderTop: '1px solid var(--cv-border-subtle)' }}>
                  <span className="text-secondary small">Already have an account? </span>
                  <a href="#/login" className="text-purple-light fw-medium text-decoration-none small">
                    Sign In
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

export default RegisterPage;
