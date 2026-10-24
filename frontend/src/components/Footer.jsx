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
        <p className="small text-secondary mb-0 mt-2">
          Movie poster images from <a href="https://www.themoviedb.org/" target="_blank" rel="noreferrer" className="text-secondary">TMDB</a>. This product uses TMDB content but is not endorsed or certified by TMDB.
        </p>
        <a href="https://www.themoviedb.org/" target="_blank" rel="noreferrer" aria-label="The Movie Database (TMDB)">
          <img
            src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_long_2-9665a76b1ae401a510ec1e0ca40ddcb3b0cfe45f1d51b77a308fea0845885648.svg"
            alt="The Movie Database (TMDB)"
            style={{ width: '100px', height: 'auto', marginTop: '0.5rem' }}
          />
        </a>
      </div>
    </footer>
  );
};

export default Footer;
