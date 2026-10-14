import React, { useState, useEffect } from 'react';
import RatingStars from './RatingStars';

const ReviewForm = ({ initialRating = 0, initialText = '', onSubmit, onCancel, submitting = false, userName = '' }) => {
  const [rating, setRating] = useState(initialRating);
  const [reviewText, setReviewText] = useState(initialText);
  const [error, setError] = useState('');

  useEffect(() => {
    setRating(initialRating);
    setReviewText(initialText);
  }, [initialRating, initialText]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (reviewText.trim().length < 3) {
      setError('Please write a review with at least 3 characters.');
      return;
    }
    setError('');
    onSubmit({ rating, reviewText: reviewText.trim() });
  };

  return (
    <form className="glass-card p-4 mb-4" onSubmit={handleSubmit}>
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
        <div>
          <h5 className="text-white mb-1">{userName ? `Share your thoughts, ${userName}` : 'Write a review'}</h5>
          <p className="text-secondary mb-0 small">Your rating and review are saved separately.</p>
        </div>
      </div>

      <div className="mb-3">
        <label className="form-label text-secondary small fw-semibold text-uppercase">Your rating</label>
        <div className="d-flex align-items-center gap-3">
          <RatingStars value={rating} onChange={setRating} size="lg" />
          {rating > 0 && <span className="text-warning fw-semibold">{rating}/5</span>}
        </div>
      </div>

      <div className="mb-3">
        <label htmlFor="reviewText" className="form-label text-secondary small fw-semibold text-uppercase">Review</label>
        <textarea
          id="reviewText"
          className="form-control"
          rows="4"
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="What stood out to you?"
          maxLength={2000}
        />
      </div>

      {error && (
        <div className="alert alert-danger py-2 px-3 small mb-3">{error}</div>
      )}

      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div className="text-secondary small">{reviewText.length}/2000</div>
        <div className="d-flex gap-2">
          {onCancel && (
            <button type="button" className="btn btn-cv-outline" onClick={onCancel} disabled={submitting}>
              Cancel
            </button>
          )}
          <button type="submit" className="btn btn-cv-primary" disabled={submitting}>
            {submitting ? <><span className="spinner-border spinner-border-sm me-2" />Saving...</> : 'Submit Review'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default ReviewForm;
