import React from 'react';
import MovieCard from './MovieCard';

const MovieGrid = ({ movies, onSelect, getActionSlot }) => {
  if (!movies || movies.length === 0) return null;

  return (
    <div className="row g-3 g-md-4">
      {movies.map(movie => (
        <div key={movie.id} className="col-6 col-md-4 col-lg-3">
          <MovieCard
            movie={movie}
            onSelect={onSelect}
            actionSlot={getActionSlot ? getActionSlot(movie) : null}
          />
        </div>
      ))}
    </div>
  );
};

export default MovieGrid;
