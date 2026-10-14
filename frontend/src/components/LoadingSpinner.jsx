import React from 'react';

const LoadingSpinner = ({ message = 'Loading CineVault Catalog...' }) => {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center py-5 my-4">
      <div className="spinner-border text-purple-light mb-3" role="status" style={{ width: '3.2rem', height: '3.2rem', borderWidth: '0.25em' }}>
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="text-secondary small tracking-wide fw-medium mb-0">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
