import React, { useEffect, useState } from 'react';
import { fetchCollectionById, removeMovieFromCollection, deleteCollection, updateCollection } from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';

const CollectionDetailsPage = ({ collectionId }) => {
  const { isAuthenticated } = useAuth();
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadCollection = async () => {
    setLoading(true);
    setError('');
    const res = await fetchCollectionById(collectionId);
    if (res.success) {
      setCollection(res.data);
    } else {
      setError(res.message || 'Unable to load this collection.');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!collectionId) return;
    loadCollection();
  }, [collectionId]);

  const handleRemoveMovie = async (movieId) => {
    const res = await removeMovieFromCollection(collectionId, movieId);
    if (res.success) {
      await loadCollection();
    } else {
      setError(res.message || 'Could not remove this movie.');
    }
  };

  const handleDeleteCollection = async () => {
    if (!window.confirm('Delete this collection permanently?')) return;
    const res = await deleteCollection(collectionId);
    if (res.success) {
      window.location.hash = '#/collections';
    } else {
      setError(res.message || 'Could not delete this collection.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="d-flex flex-column min-vh-100">
        <Navbar />
        <main className="container py-5">
          <div className="glass-card p-5 text-center">
            <h3 className="text-white">Collection details</h3>
            <p className="text-secondary mb-4">Please log in to view private collections.</p>
            <a href="#/login" className="btn btn-cv-primary">Log In</a>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar currentPath="#/collections" />
      <main className="container py-5">
        <button className="btn btn-cv-outline mb-4" onClick={() => window.history.back()}>
          <i className="bi bi-arrow-left me-2"></i>Back
        </button>

        {loading ? (
          <LoadingSpinner message="Loading collection details..." />
        ) : error ? (
          <div className="glass-card p-5 text-center">
            <h4 className="text-white mb-3">Could not load collection</h4>
            <p className="text-secondary mb-0">{error}</p>
          </div>
        ) : collection ? (
          <>
            <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
              <div>
                <p className="text-purple-light small text-uppercase fw-semibold mb-1">Collection</p>
                <h1 className="text-white mb-1">{collection.name}</h1>
                <p className="text-secondary mb-0">{collection.movieCount ?? collection.movies?.length ?? 0} movies</p>
              </div>
              <div className="d-flex gap-2">
                <button className="btn btn-cv-outline" onClick={() => updateCollection(collection.id, { isPublic: !collection.isPublic }).then(() => loadCollection())}>
                  {collection.isPublic ? 'Make Private' : 'Make Public'}
                </button>
                <button className="btn btn-outline-danger" onClick={handleDeleteCollection}>Delete</button>
              </div>
            </div>

            {collection.description && <p className="text-secondary mb-4">{collection.description}</p>}

            {!collection.movies || collection.movies.length === 0 ? (
              <div className="glass-card p-5 text-center">
                <h4 className="text-white mb-2">This collection is empty.</h4>
                <p className="text-secondary mb-0">Add movies from your discovery experience.</p>
              </div>
            ) : (
              <div className="row g-4">
                {collection.movies.map((movie) => (
                  <div key={movie.id} className="col-md-4 col-lg-3">
                    <div className="glass-card p-2 h-100">
                      <a href={`#/movies/${movie.id}`}>
                        <img src={movie.poster_url || 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=600'} alt={movie.title}
                          className="w-100 rounded-3 mb-3" style={{ height: '260px', objectFit: 'cover' }} />
                      </a>
                      <div className="d-flex justify-content-between align-items-center gap-2">
                        <a href={`#/movies/${movie.id}`} className="text-white fw-semibold text-decoration-none">{movie.title}</a>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleRemoveMovie(movie.id)}>
                          <i className="bi bi-x-lg"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : null}
      </main>
      <Footer />
    </div>
  );
};

export default CollectionDetailsPage;
