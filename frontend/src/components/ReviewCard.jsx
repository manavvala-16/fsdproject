import React from 'react';

const formatDate = (dateString) => {
  if (!dateString) return 'Just now';
  const date = new Date(dateString);
  return isNaN(date) ? 'Just now' : date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const ReviewCard = ({ review, currentUserId, onEdit, onDelete }) => {
  const isOwner = Number(review.userId) === Number(currentUserId);

  return (
    <div className="glass-card p-4 mb-3">
      <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap">
        <div>
          <div className="d-flex align-items-center gap-2 mb-2">
            <div className="rounded-circle text-white d-flex align-items-center justify-content-center fw-bold"
              style={{ width: '32px', height: '32px', fontSize: '0.8rem', background: 'linear-gradient(135deg, #8a2be2, #4c1d95)' }}>
              {review.userName?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <div className="fw-semibold text-white">{review.userName || 'User'}</div>
              <div className="text-secondary small">{formatDate(review.createdAt)}</div>
            </div>
          </div>
        </div>

        {review.userRating && (
          <div className="d-flex align-items-center gap-1 text-warning small">
            <i className="bi bi-star-fill"></i>
            <span className="fw-semibold text-white">{review.userRating}/5</span>
          </div>
        )}
      </div>

      <p className="text-light mt-3 mb-0" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.7' }}>
        {review.reviewText}
      </p>

      {isOwner && (
        <div className="d-flex gap-2 mt-3">
          <button className="btn btn-cv-outline btn-sm" onClick={() => onEdit(review)}>
            <i className="bi bi-pencil-square me-1"></i>Edit
          </button>
          <button className="btn btn-outline-danger btn-sm" onClick={() => onDelete(review.id)}>
            <i className="bi bi-trash me-1"></i>Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewCard;
