import React from 'react';

const CollectionCard = ({ collection, onOpen, onEdit, onDelete, onTogglePrivacy }) => {
  const previewMovies = collection.movies?.slice(0, 3) || [];

  return (
    <div className="glass-card h-100 p-3 d-flex flex-column">
      <div className="d-flex justify-content-between align-items-start gap-2 mb-3">
        <div>
          <h5 className="text-white mb-1">{collection.name}</h5>
          <div className="text-secondary small">{collection.movieCount ?? collection.movies?.length ?? 0} movies</div>
        </div>
        <button
          type="button"
          className={`btn btn-sm ${collection.isPublic ? 'btn-success' : 'btn-outline-secondary'}`}
          onClick={() => onTogglePrivacy && onTogglePrivacy(collection)}
        >
          {collection.isPublic ? 'Public' : 'Private'}
        </button>
      </div>

      {collection.description ? (
        <p className="text-secondary small mb-3" style={{ minHeight: '42px' }}>{collection.description}</p>
      ) : (
        <p className="text-secondary small mb-3">No description yet.</p>
      )}

      <div className="d-flex gap-2 mb-3">
        {previewMovies.length > 0 ? previewMovies.map((movie) => (
          <img
            key={movie.id}
            src={movie.poster_url || 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=300'}
            alt={movie.title}
            className="rounded-3"
            style={{ width: '60px', height: '88px', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }}
          />
        )) : (
          <div className="text-secondary small py-3 w-100 border border-dashed rounded-3 text-center" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>
            No movies yet
          </div>
        )}
      </div>

      <div className="mt-auto d-flex flex-wrap gap-2">
        <button className="btn btn-cv-primary btn-sm flex-fill" onClick={() => onOpen(collection)}>
          Open
        </button>
        <button className="btn btn-cv-outline btn-sm" onClick={() => onEdit(collection)}>
          Edit
        </button>
        <button className="btn btn-outline-danger btn-sm" onClick={() => onDelete(collection.id)}>
          Delete
        </button>
      </div>
    </div>
  );
};

export default CollectionCard;
