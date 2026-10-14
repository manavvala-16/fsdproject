import React from 'react';

const RatingStars = ({ value = 0, onChange, readOnly = false, size = 'md' }) => {
  const stars = Array.from({ length: 5 }, (_, index) => index + 1);
  const activeColor = '#fbbf24';
  const inactiveColor = 'rgba(255,255,255,0.18)';

  const handleClick = (starValue) => {
    if (!readOnly && onChange) onChange(starValue);
  };

  return (
    <div className="d-flex align-items-center gap-2">
      {stars.map((star) => {
        const filled = star <= Math.round(value || 0);
        return (
          <button
            key={star}
            type="button"
            className="btn p-0 border-0 bg-transparent"
            onClick={() => handleClick(star)}
            disabled={readOnly}
            aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
            style={{ lineHeight: 1, opacity: readOnly ? 1 : 0.95 }}
          >
            <i
              className={`bi ${filled ? 'bi-star-fill' : 'bi-star'}`}
              style={{
                fontSize: size === 'lg' ? '1.8rem' : size === 'sm' ? '1rem' : '1.35rem',
                color: filled ? activeColor : inactiveColor,
                transition: 'transform 0.2s ease',
                transform: filled ? 'scale(1.03)' : 'scale(1)'
              }}
            />
          </button>
        );
      })}
    </div>
  );
};

export default RatingStars;
