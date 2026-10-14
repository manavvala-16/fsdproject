import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';
import CollectionCard from '../components/CollectionCard';
import { fetchCollections, createCollection, updateCollection, deleteCollection, addMovieToCollection, removeMovieFromCollection } from '../services/api';

const MyCollectionsPage = () => {
  const { isAuthenticated, user } = useAuth();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', description: '', isPublic: true });
  const [editingId, setEditingId] = useState(null);

  const loadCollections = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError('');
    const res = await fetchCollections();
    if (res.success) {
      setCollections(res.data || []);
    } else {
      setError(res.message || 'Could not load your collections.');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    loadCollections();
  }, [isAuthenticated]);

  const submitCollection = async (e) => {
    e.preventDefault();
    const trimmedName = form.name.trim();
    if (!trimmedName) {
      setError('Collection name is required.');
      return;
    }

    setSaving(true);
    setError('');
    let res;
    if (editingId) {
      res = await updateCollection(editingId, { name: trimmedName, description: form.description, isPublic: form.isPublic });
    } else {
      res = await createCollection({ name: trimmedName, description: form.description, isPublic: form.isPublic });
    }

    if (res.success) {
      setForm({ name: '', description: '', isPublic: true });
      setEditingId(null);
      await loadCollections();
    } else {
      setError(res.message || 'Unable to save this collection.');
    }
    setSaving(false);
  };

  const handleEdit = (collection) => {
    setEditingId(collection.id);
    setForm({
      name: collection.name,
      description: collection.description || '',
      isPublic: Boolean(collection.isPublic)
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (collectionId) => {
    if (!window.confirm('Delete this collection?')) return;
    const res = await deleteCollection(collectionId);
    if (res.success) {
      await loadCollections();
    } else {
      setError(res.message || 'Could not delete this collection.');
    }
  };

  const handleTogglePrivacy = async (collection) => {
    const res = await updateCollection(collection.id, { isPublic: !collection.isPublic });
    if (res.success) {
      await loadCollections();
    } else {
      setError(res.message || 'Could not change collection privacy.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="d-flex flex-column min-vh-100">
        <Navbar />
        <main className="container py-5">
          <div className="glass-card p-5 text-center">
            <h3 className="text-white mb-3">My Collections</h3>
            <p className="text-secondary mb-4">Sign in to curate your own movie shelves.</p>
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
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
          <div>
            <p className="text-purple-light text-uppercase small fw-semibold mb-1">Your library</p>
            <h1 className="text-white mb-0">My Collections</h1>
          </div>
          <div className="text-secondary small">{user?.name}</div>
        </div>

        <div className="glass-card p-4 mb-4">
          <h4 className="text-white mb-3">{editingId ? 'Edit collection' : 'Create a new collection'}</h4>
          <form onSubmit={submitCollection}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label text-secondary small fw-semibold text-uppercase">Collection name</label>
                <input
                  className="form-control"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Late Night Cinema"
                />
              </div>
              <div className="col-md-6">
                <label className="form-label text-secondary small fw-semibold text-uppercase">Privacy</label>
                <select
                  className="form-select"
                  value={form.isPublic ? 'public' : 'private'}
                  onChange={(e) => setForm({ ...form, isPublic: e.target.value === 'public' })}
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>
              <div className="col-12">
                <label className="form-label text-secondary small fw-semibold text-uppercase">Description</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="A mood-based movie shelf for late-night watching."
                />
              </div>
            </div>

            {error && <div className="alert alert-danger mt-3 py-2 px-3 small mb-0">{error}</div>}

            <div className="d-flex justify-content-end gap-2 mt-3">
              {editingId && (
                <button type="button" className="btn btn-cv-outline" onClick={() => { setEditingId(null); setForm({ name: '', description: '', isPublic: true }); setError(''); }}>
                  Cancel
                </button>
              )}
              <button type="submit" className="btn btn-cv-primary" disabled={saving}>
                {saving ? <><span className="spinner-border spinner-border-sm me-2" />Saving...</> : editingId ? 'Update Collection' : 'Create Collection'}
              </button>
            </div>
          </form>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading your collections..." />
        ) : collections.length === 0 ? (
          <div className="glass-card p-5 text-center">
            <h4 className="text-white mb-2">No collections yet</h4>
            <p className="text-secondary mb-0">Create your first shelf of movies.</p>
          </div>
        ) : (
          <div className="row g-4">
            {collections.map((collection) => (
              <div key={collection.id} className="col-lg-4 col-md-6">
                <CollectionCard
                  collection={collection}
                  onOpen={(item) => window.location.hash = `#/collections/${item.id}`}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onTogglePrivacy={handleTogglePrivacy}
                />
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default MyCollectionsPage;
