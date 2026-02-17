import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useWebSocket } from "../../../context/useWebSocket.js";
import api from "../../../api/client.js";

const BoardsPage = () => {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBoard, setNewBoard] = useState({ name: "", description: "" });
  const [error, setError] = useState("");
  const { socket } = useWebSocket();

  const fetchBoards = async () => {
    try {
      const res = await api.get("/board");
      if (res.data?.success) {
        setBoards(res.data.data || []);
      }
    } catch (err) {
      setError("Failed to load boards",err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoards();
  }, []);

  // WebSocket real-time updates
  useEffect(() => {
    if (socket) {
      const handleBoardUpdate = (data) => {
        setBoards((prev) => {
          const index = prev.findIndex((b) => b._id === data.data?._id);
          if (data.type === "board_created") {
            return [data.data, ...prev];
          } else if (index >= 0) {
            const updated = [...prev];
            updated[index] = data.data;
            return updated;
          }
          return prev;
        });
      };

      socket.on("board_updated", handleBoardUpdate);
      return () => socket.off("board_updated", handleBoardUpdate);
    }
  }, [socket]);

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    setError("");
    
    try {
      const res = await api.post("/board", newBoard);
      if (res.data?.success) {
        setNewBoard({ name: "", description: "" });
        setShowCreateModal(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create board");
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-50">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading boards...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h2 mb-1 fw-bold">Your Boards</h1>
          <small className="text-muted">Manage your projects and teams</small>
        </div>
        <button 
          className="btn btn-primary btn-lg px-4" 
          onClick={() => setShowCreateModal(true)}
        >
          <i className="bi bi-plus-circle me-2"></i>New Board
        </button>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show mb-4">
          {error}
          <button className="btn-close" onClick={() => setError("")} />
        </div>
      )}

      {boards.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-columns-gap display-1 text-muted mb-4 d-block"></i>
          <h3 className="text-muted mb-3">No boards yet</h3>
          <p className="text-muted mb-4">Create your first board to get started</p>
          <button 
            className="btn btn-primary btn-lg px-4" 
            onClick={() => setShowCreateModal(true)}
          >
            Create First Board
          </button>
        </div>
      ) : (
        <div className="row g-4">
          {boards.map((board) => (
            <div className="col-xl-3 col-lg-4 col-md-6" key={board._id}>
              <Link 
                to={`/boards/${board._id}`} 
                className="text-decoration-none"
              >
                <div className="card h-100 shadow-sm hover-shadow-lg transition-all border-0 overflow-hidden">
                  <div className="card-body p-4 d-flex flex-column">
                    <h5 className="card-title fw-bold mb-2 text-truncate">{board.name}</h5>
                    {board.description && (
                      <p className="card-text text-muted small flex-grow-1 mb-3 lh-sm">
                        {board.description}
                      </p>
                    )}
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="badge bg-primary">
                        {board.members?.length || 0} members
                      </div>
                      <i className="bi bi-chevron-right text-muted"></i>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}

      
      {showCreateModal && (
        <>
          <div 
            className="modal fade show d-block" 
            tabIndex="-1" 
            style={{backgroundColor: 'rgba(0,0,0,0.5)'}}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg">
                <form onSubmit={handleCreateBoard}>
                  <div className="modal-header border-0 pb-0">
                    <h5 className="modal-title fw-bold">Create New Board</h5>
                    <button 
                      type="button" 
                      className="btn-close" 
                      onClick={() => setShowCreateModal(false)}
                    />
                  </div>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Board Name</label>
                      <input
                        className="form-control form-control-lg"
                        value={newBoard.name}
                        onChange={(e) => setNewBoard({...newBoard, name: e.target.value})}
                        placeholder="My Project Board"
                        required
                      />
                    </div>
                    <div className="mb-0">
                      <label className="form-label fw-semibold">Description (optional)</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        value={newBoard.description}
                        onChange={(e) => setNewBoard({...newBoard, description: e.target.value})}
                        placeholder="Brief description of what this board is for..."
                      />
                    </div>
                  </div>
                  <div className="modal-footer border-0 pt-0">
                    <button 
                      type="button" 
                      className="btn btn-outline-secondary"
                      onClick={() => setShowCreateModal(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary px-4">
                      Create Board
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BoardsPage;
