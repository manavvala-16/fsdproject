import React, { useEffect, useState } from 'react';

const AddToCollectionModal = ({ isOpen, onClose, collections = [], onAdd, onCreateNew, loading }) => {
  const [selected, setSelected] = useState([]);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setSelected([]);
      setNewName('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggle = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id]
    );
  };

  return (
    <div className="modal fade show d-block" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content bg-dark border border-secondary">
          <div className="modal-header border-secondary">
            <h5 className="modal-title text-white">Add to Collection</h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            {collections.length === 0 ? (
              <div className="text-secondary">You have no collections yet.</div>
            ) : (
              <div className="d-flex flex-column gap-2">
                {collections.map((collection) => (
                  <label key={collection.id} className="d-flex align-items-center gap-3 glass-card p-3 cursor-pointer" style={{ cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={selected.includes(collection.id)}
                      onChange={() => handleToggle(collection.id)}
                    />
                    <span className="text-white fw-medium">{collection.name}</span>
                  </label>
                ))}
              </div>
            )}

            <div className="mt-4">
              <label className="form-label text-secondary small fw-semibold text-uppercase">Create a new collection</label>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="New collection name"
                />
                <button
                  type="button"
                  className="btn btn-cv-primary"
                  disabled={!newName.trim() || loading}
                  onClick={() => {
                    const trimmed = newName.trim();
                    if (!trimmed) return;
                    onCreateNew(trimmed);
                    setNewName('');
                  }}
                >
                  Create
                </button>
              </div>
            </div>
          </div>
          <div className="modal-footer border-secondary">
            <button type="button" className="btn btn-cv-outline" onClick={onClose}>Close</button>
            <button
              type="button"
              className="btn btn-cv-primary"
              disabled={loading || selected.length === 0}
              onClick={() => {
                onAdd(selected);
                setSelected([]);
              }}
            >
              {loading ? <><span className="spinner-border spinner-border-sm me-2" />Saving...</> : 'Add Selected'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddToCollectionModal;
