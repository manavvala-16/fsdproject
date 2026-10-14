import React from 'react';

const Footer = () => {
  return (
    <footer className="py-4 mt-5 border-top border-secondary border-opacity-25" style={{ background: '#08060f' }}>
      <div className="container text-center">
        <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
          <i className="bi bi-film text-purple-light"></i>
          <span className="fw-bold text-white">CineVault</span>
          <span className="text-secondary">—</span>
          <span className="tagline-serif text-secondary small">Your Cinema. Your Story.</span>
        </div>
        <p className="small text-secondary mb-0">
          Personalized Film Discovery & Curation Platform • All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
