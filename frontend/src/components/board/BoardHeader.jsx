import React, { useState } from "react";

const BoardHeader = ({ board, lists = [], onUpdate, onDelete }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({
    name: board?.name || "",
    description: board?.description || ""
  });

  const handleEdit = () => {
    setEditing(true);
    setDraft({ name: board.name, description: board.description || "" });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await onUpdate(draft);
      setEditing(false);
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  const handleDelete = () => {
    if (window.confirm(`Delete "${board.name}"? This cannot be undone.`)) {
      onDelete();
    }
  };

  if (!board) return null;

  return (
    <div className="mb-4 pb-3 border-bottom">
      {editing ? (
        <form onSubmit={handleSave}>
          <div className="row g-3 align-items-end">
            <div className="col-md-8">
              <label className="form-label fw-bold fs-3 mb-2 d-block">Board Name</label>
              <input
                className="form-control form-control-lg"
                value={draft.name}
                onChange={(e) => setDraft({...draft, name: e.target.value})}
                required
                autoFocus
              />
            </div>
            <div className="col-md-4">
              <button className="btn btn-success btn-lg w-100 mb-2" type="submit">
                Save
              </button>
              <button 
                className="btn btn-outline-secondary w-100" 
                type="button"
                onClick={() => setEditing(false)}
              >
                Cancel
              </button>
            </div>
          </div>
          <div className="mt-3">
            <label className="form-label fw-semibold">Description</label>
            <textarea
              className="form-control"
              rows="2"
              value={draft.description}
              onChange={(e) => setDraft({...draft, description: e.target.value})}
              placeholder="Brief description..."
            />
          </div>
        </form>
      ) : (
        <div>
          <div className="d-flex align-items-center justify-content-between mb-2">
            <h1 className="h2 fw-bold mb-0 me-3 text-truncate flex-grow-1">{board.name}</h1>
            <div className="btn-group" role="group">
              <button className="btn btn-outline-primary btn-sm" onClick={handleEdit}>
                <i className="bi bi-pencil"></i> Edit
              </button>
              <button className="btn btn-outline-danger btn-sm" onClick={handleDelete}>
                <i className="bi bi-trash"></i> Delete
              </button>
            </div>
          </div>
          {board.description && (
            <p className="text-muted mb-0 lh-sm">{board.description}</p>
          )}
          <div className="mt-2">
            <span className="badge bg-secondary me-2">
              {board.members?.length || 0} members
            </span>
            <span className="badge bg-info">
              {lists.length || 0} lists
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default BoardHeader;
