import React from 'react';

const formatRuntime = (minutes) => {
  if (!minutes) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

const MovieCard = ({ movie, onSelect, actionSlot }) => {
  const genres = Array.isArray(movie.genres)
    ? movie.genres
    : typeof movie.genre_list === 'string'
    ? movie.genre_list.split(',')
    : [];

  return (
    <div
      className="glass-card cv-card-interactive overflow-hidden h-100 d-flex flex-column"
      style={{ cursor: 'pointer' }}
    >
      {/* Poster */}
      <div
        className="position-relative"
        style={{ height: '300px', overflow: 'hidden', flexShrink: 0, backgroundColor: '#0f0c1b' }}
        onClick={() => onSelect && onSelect(movie)}
      >
        <img
          src={movie.poster_url || `https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600`}
          alt={movie.title}
          className="w-100 h-100 object-fit-cover"
          loading="lazy"
          onError={e => {
            e.target.src = 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=600';
          }}
        />
        {/* Rating badge */}
        {movie.avg_rating && (
          <div
            className="position-absolute top-0 end-0 m-2 px-2 py-0 rounded-1 d-flex align-items-center gap-1"
            style={{ background: 'rgba(13, 11, 20, 0.85)', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <i className="bi bi-star-fill" style={{ color: 'var(--cv-gold)', fontSize: '0.68rem' }}></i>
            <span className="text-white fw-medium" style={{ fontSize: '0.75rem' }}>
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
                backgroundColor: 'rgba(13, 11, 20, 0.85)',
                color: 'var(--cv-text-main)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                fontSize: '0.7rem',
                borderRadius: '4px',
                fontWeight: 500
              }}
            >
              {genres[0].trim()}
            </span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-3 d-flex flex-column flex-grow-1">
        <div onClick={() => onSelect && onSelect(movie)} style={{ flexGrow: 1 }}>
          <h6
            className="fw-semibold text-white mb-1 text-truncate"
            style={{ fontSize: '0.925rem' }}
            title={movie.title}
          >
            {movie.title}
          </h6>
          <div className="d-flex align-items-center justify-content-between text-secondary small mb-2" style={{ fontSize: '0.8rem' }}>
            <span>{movie.release_year}</span>
            {formatRuntime(movie.runtime) && (
              <span>{formatRuntime(movie.runtime)}</span>
            )}
          </div>
        </div>
        {/* Action Slot */}
        {actionSlot && <div className="mt-auto pt-2">{actionSlot}</div>}
      </div>
    </div>
  );
};

export default MovieCard;

