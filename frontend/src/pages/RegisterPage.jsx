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
    } catch (err) {
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
            <div className="col-md-8 col-lg-6">
              <div className="glass-card p-4 p-sm-5 position-relative">
                {/* Header */}
                <div className="text-center mb-4">
                  <div className="d-inline-flex align-items-center justify-content-center rounded-circle p-3 mb-3" style={{ background: 'linear-gradient(135deg, #8a2be2 0%, #4c1d95 100%)', boxShadow: '0 0 20px rgba(138, 43, 226, 0.4)', width: '64px', height: '64px' }}>
                    <i className="bi bi-person-plus-fill text-white fs-3"></i>
                  </div>
                  <h3 className="fw-bold text-white mb-1">Create CineVault Account</h3>
                  <p className="text-secondary small">Join the personalized film discovery & curation platform</p>
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

                {/* Registration Form */}
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label text-secondary small fw-semibold">Full Name</label>
                    <div className="input-group">
                      <span className="input-group-text bg-dark border-secondary border-opacity-50 text-secondary">
                        <i className="bi bi-person"></i>
                      </span>
                      <input
                        type="text"
                        name="name"
                        className="form-control bg-dark text-light border-secondary border-opacity-50"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={handleChange}
                        disabled={isSubmitting}
                        required
                      />
                    </div>
                  </div>

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

                  <div className="row g-3 mb-4">
                    <div className="col-sm-6">
                      <label className="form-label text-secondary small fw-semibold">Password</label>
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
                    <div className="col-sm-6">
                      <label className="form-label text-secondary small fw-semibold">Confirm Password</label>
                      <div className="input-group">
                        <span className="input-group-text bg-dark border-secondary border-opacity-50 text-secondary">
                          <i className="bi bi-shield-check"></i>
                        </span>
                        <input
                          type="password"
                          name="confirmPassword"
                          className="form-control bg-dark text-light border-secondary border-opacity-50"
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
                    className="btn btn-cv-primary w-100 py-2 d-flex align-items-center justify-content-center gap-2 fw-semibold"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        <span>Creating Account...</span>
                      </>
                    ) : (
                      <>
                        <i className="bi bi-person-check-fill"></i>
                        <span>Register Account</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Footer Link */}
                <div className="text-center mt-4 pt-3 border-top border-secondary border-opacity-25">
                  <span className="text-secondary small">Already have an account? </span>
                  <a href="#/login" className="text-purple-light fw-bold text-decoration-none small hover-underline">
                    Sign In Here
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
