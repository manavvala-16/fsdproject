import React from 'react';

const EmptyState = ({ icon, title, subtitle, actionLabel, actionHref }) => {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center py-5 text-center px-3">
      <div className="mb-4" style={{ fontSize: '4rem', opacity: 0.35 }}>
        <i className={`bi ${icon}`}></i>
      </div>
      <h5 className="fw-bold text-white mb-2">{title}</h5>
      {subtitle && <p className="text-secondary mb-4" style={{ maxWidth: '420px' }}>{subtitle}</p>}
      {actionLabel && actionHref && (
        <a href={actionHref} className="btn btn-cv-primary d-inline-flex align-items-center gap-2">
          <i className="bi bi-compass"></i> {actionLabel}
        </a>
      )}
    </div>
  );
};

export default EmptyState;
