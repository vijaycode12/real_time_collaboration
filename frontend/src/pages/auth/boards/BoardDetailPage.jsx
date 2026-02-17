import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  DragDropContext,
  Droppable,
  Draggable
} from "@hello-pangea/dnd";
import api from "../../../api/client.js";
import { useWebSocket } from "../../../context/useWebSocket.js";
import BoardHeader from "../../../components/board/BoardHeader.jsx";
import ListColumn from "../../../components/board/ListColumn.jsx";
import ActivityPanel from "../../../components/board/ActivityPanel.jsx";
import SearchBar from "../../../components/board/SearchBar.jsx";

const BoardDetailPage = () => {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const { socket, joinBoard, connected } = useWebSocket();
  
  const [board, setBoard] = useState(null);
  const [lists, setLists] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newListTitle, setNewListTitle] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  
  const fetchBoard = useCallback(async () => {
    try {
      const res = await api.get(`/board/${boardId}`);
      setBoard(res.data?.data);
    } catch (err) {
      console.error(err);
    }
  }, [boardId]);

  const fetchLists = useCallback(async () => {
    try {
      const res = await api.get(`/list/boards/${boardId}/lists`);
      setLists(res.data?.data || []);
    } catch (err) {
      console.error(err);
    }
  }, [boardId]);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await api.get(`/task/tasks`, { params: { boardId } });
      setTasks(res.data?.data || []);
    } catch (err) {
      console.error(err);
    }
  }, [boardId]);

  const fetchActivities = useCallback(async () => {
    try {
      const res = await api.get(`/activity/boards/${boardId}/activity`);
      setActivities(res.data?.data || []);
    } catch (err) {
      console.error(err);
    }
  }, [boardId]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await fetchBoard();
        await fetchLists();
        await fetchTasks();
        await fetchActivities();
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [fetchBoard, fetchLists, fetchTasks, fetchActivities]); 

  useEffect(() => {
    if (socket && boardId) {
      joinBoard(boardId);
      
      const handleBoardUpdate = (data) => {
        if (data.boardId === boardId) {
          switch (data.type) {
            case "task_created":
            case "task_moved":
            case "task_updated":
            case "task_deleted":
              fetchTasks();
              fetchActivities();
              break;
            case "list_created":
            case "list_updated":
            case "list_deleted":
              fetchLists();
              break;
            case "board_updated":
              setBoard(data.data);
              break;
          }
        }
      };

      socket.on("board_updated", handleBoardUpdate);
      return () => socket.off("board_updated", handleBoardUpdate);
    }
  }, [socket, boardId, fetchTasks, fetchLists, fetchActivities, joinBoard]);

  
  const tasksByList = useMemo(() => {
    const map = {};
    lists.forEach((list) => {
      map[list._id] = [];
    });
    tasks.forEach((task) => {
      const listId = task.list?._id || task.list;
      if (map[listId]) map[listId].push(task);
    });
    return map;
  }, [lists, tasks]);

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId && 
        source.index === destination.index) return;

    const task = tasks.find((t) => t._id === draggableId);
    if (!task) return;

    try {
      await api.post(`/tasks/${task._id}/move`, { listId: destination.droppableId });
      
    
      setTasks((prevTasks) =>
        prevTasks.map((t) =>
          t._id === draggableId 
            ? { ...t, list: { _id: destination.droppableId } }
            : t
        )
      );
    } catch (err) {
      console.error("Move failed:", err);
      fetchTasks(); // Refresh on error
    }
  };

  const handleCreateList = async (e) => {
    e.preventDefault();
    if (!newListTitle.trim()) return;
    
    try {
      const res = await api.post(`/boards/${boardId}/lists`, { title: newListTitle });
      setLists((prev) => [...prev, res.data.data]);
      setNewListTitle("");
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-50">
        <div className="spinner-border text-primary fs-1" role="status">
          <span className="visually-hidden">Loading board...</span>
        </div>
      </div>
    );
  }

  if (!board) {
    return <div className="alert alert-warning">Board not found</div>;
  }

  return (
    <div>
      <div className="alert alert-info d-flex align-items-center mb-4 shadow-sm">
        <div className={`me-3 fs-5 ${connected ? 'text-success' : 'text-warning'}`}>
          {connected ? 'Live Collaboration' : 'Reconnecting...'}
        </div>
        <small className="flex-grow-1">Real-time updates across all users</small>
      </div>

      <BoardHeader 
        board={board} 
        lists={lists}
        onUpdate={fetchBoard} 
        onDelete={() => navigate("/boards")}
      />
      
      <SearchBar 
        boardId={boardId} 
        onResults={setSearchResults}
      />

      <div className="dnd-board position-relative mb-4">
        <DragDropContext onDragEnd={onDragEnd}>
          <div 
            className="d-flex flex-nowrap overflow-auto pb-4 gap-3 px-1" 
            style={{ 
              scrollbarWidth: 'none', 
              msOverflowStyle: 'none' 
            }}
          >
            {lists.map((list) => (
              <ListColumn
                key={list._id}
                list={list}
                tasks={tasksByList[list._id] || []}
                boardId={boardId}
                onRefresh={fetchTasks}
              />
            ))}
            
            <div className="flex-shrink-0" style={{ minWidth: 280 }}>
              <div className="card bg-light border-dashed h-100">
                <div className="card-body d-flex flex-column align-items-center justify-content-center text-center p-4">
                  <i className="bi bi-plus-circle-fill fs-1 text-muted mb-3"></i>
                  <form onSubmit={handleCreateList} className="w-100">
                    <div className="input-group input-group-sm">
                      <input
                        className="form-control border-primary"
                        placeholder="New list name..."
                        value={newListTitle}
                        onChange={(e) => setNewListTitle(e.target.value)}
                        style={{borderRight: 'none'}}
                      />
                      <button className="btn btn-primary px-3" type="submit">
                        Add
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </DragDropContext>
        
        <style jsx>{`
          .dnd-board::-webkit-scrollbar {
            display: none;
          }
          .dnd-board::-webkit-scrollbar-track {
            display: none;
          }
        `}</style>
      </div>

      <div className="row g-4">
        {searchResults.length > 0 && (
          <div className="col-lg-8">
            <div className="card">
              <div className="card-body">
                <h6>🔍 Search Results ({searchResults.length})</h6>
              </div>
            </div>
          </div>
        )}
        <div className="col-lg-4">
          <ActivityPanel activities={activities} />
        </div>
      </div>
    </div>
  );
};

export default BoardDetailPage;
