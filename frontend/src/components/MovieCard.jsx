import React from 'react';

const formatRuntime = (minutes) => {
  if (!minutes) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

const StarRating = ({ rating }) => {
  if (!rating) return null;
  return (
    <span className="d-inline-flex align-items-center gap-1">
      <i className="bi bi-star-fill" style={{ color: '#fbbf24', fontSize: '0.75rem' }}></i>
      <span className="fw-semibold" style={{ fontSize: '0.82rem' }}>{parseFloat(rating).toFixed(1)}</span>
    </span>
  );
};

const MovieCard = ({ movie, onSelect, actionSlot }) => {
  const genres = Array.isArray(movie.genres)
    ? movie.genres
    : typeof movie.genre_list === 'string'
    ? movie.genre_list.split(',')
    : [];

  return (
    <div
      className="glass-card overflow-hidden h-100 d-flex flex-column"
      style={{ cursor: 'pointer', transition: 'transform 0.25s ease, box-shadow 0.25s ease' }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 12px 40px rgba(138, 43, 226, 0.3)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '';
      }}
    >
      {/* Poster */}
      <div
        className="position-relative"
        style={{ height: '300px', overflow: 'hidden', flexShrink: 0 }}
        onClick={() => onSelect && onSelect(movie)}
      >
        <img
          src={movie.poster_url || `https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600`}
          alt={movie.title}
          className="w-100 h-100"
          style={{ objectFit: 'cover', transition: 'transform 0.4s ease' }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          onError={e => {
            e.target.src = 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=600';
          }}
        />
        {/* Rating badge */}
        {movie.avg_rating && (
          <div
            className="position-absolute top-0 end-0 m-2 px-2 py-1 rounded-2 d-flex align-items-center gap-1"
            style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
          >
            <i className="bi bi-star-fill" style={{ color: '#fbbf24', fontSize: '0.7rem' }}></i>
            <span className="text-white fw-bold" style={{ fontSize: '0.78rem' }}>
              {parseFloat(movie.avg_rating).toFixed(1)}
            </span>
          </div>
        )}
        {/* Genre badge */}
        {genres[0] && (
          <div className="position-absolute bottom-0 start-0 m-2">
            <span
              className="badge px-2 py-1"
              style={{
                background: 'rgba(138,43,226,0.8)',
                backdropFilter: 'blur(6px)',
                fontSize: '0.72rem',
                borderRadius: '6px'
              }}
            >
              {genres[0]}
            </span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-3 d-flex flex-column flex-grow-1">
        <div onClick={() => onSelect && onSelect(movie)} style={{ flexGrow: 1 }}>
          <h6
            className="fw-bold text-white mb-1 text-truncate"
            style={{ fontSize: '0.95rem' }}
            title={movie.title}
          >
            {movie.title}
          </h6>
          <div className="d-flex align-items-center justify-content-between text-secondary small mb-2">
            <span>{movie.release_year}</span>
            {formatRuntime(movie.runtime) && (
              <span className="d-flex align-items-center gap-1">
                <i className="bi bi-clock" style={{ fontSize: '0.72rem' }}></i>
                {formatRuntime(movie.runtime)}
              </span>
            )}
          </div>
        </div>
        {/* Action Slot (Watchlist/Watched buttons injected by parent) */}
        {actionSlot && <div className="mt-auto pt-2">{actionSlot}</div>}
      </div>
    </div>
  );
};

export default MovieCard;
