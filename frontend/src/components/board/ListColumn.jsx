import React, { useState, useCallback } from "react";
import {
  Droppable,
  Draggable
} from "@hello-pangea/dnd";
import TaskCard from "./TaskCard.jsx";
import api from "../../api/client.js";

const ListColumn = ({ list, tasks, onRefresh }) => {
  const [showNewTask, setShowNewTask] = useState(false);
  const [newTask, setNewTask] = useState({ 
    title: "", 
    description: "", 
    priority: "medium" 
  });

  // FIXED: Actually USED function
  const handleCreateTask = useCallback(async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    try {
      await api.post(`/lists/${list._id}/tasks`, newTask);
      setNewTask({ title: "", description: "", priority: "medium" });
      setShowNewTask(false);  // ← USED
      onRefresh?.();
    } catch (err) {
      console.error("Create task failed:", err);
    }
  }, [newTask, list._id, onRefresh]);

 
  return (
    <div className="card h-100 shadow-sm" style={{ minWidth: 280 }}>
      <div className="card-header d-flex justify-content-between align-items-center bg-light">
        <strong className="text-truncate">{list.title}</strong>
        <span className="badge bg-secondary fs-2xs">{tasks.length}</span>
      </div>
      
      <Droppable droppableId={list._id} key={list._id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-grow-1 p-3 position-relative list-column ${
              snapshot.isDraggingOver 
                ? 'dragging-over bg-info bg-opacity-10 border border-info border-2 rounded' 
                : 'bg-white'
            }`}
            style={{ 
              minHeight: 200,
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            {tasks.length === 0 ? ( 
              <div className="text-center py-4 text-muted opacity-75">
                <i className="bi bi-plus-circle-fill fs-1 mb-2 d-block opacity-50"></i>
                <small>Drop tasks here</small>
              </div>
            ) : (
              tasks.map((task, index) => (
                <Draggable key={task._id} draggableId={task._id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`mb-2 task-card transition-all ${
                        snapshot.isDragging 
                          ? 'shadow-lg border-primary border-2 scale-105 z-3' 
                          : 'shadow-sm hover:shadow-md hover:scale-102'
                      }`}
                      style={{
                        ...provided.draggableProps.style,
                        transform: snapshot.isDragging 
                          ? provided.draggableProps.style?.transform 
                          : undefined
                      }}
                    >
                      <TaskCard task={task} />
                    </div>
                  )}
                </Draggable>
              ))
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
      
      <div className="card-footer p-2 bg-light border-top-0">
        {showNewTask ? (  
          <form onSubmit={handleCreateTask}>
            <div className="row g-1">
              <div className="col-8">
                <input
                  className="form-control form-control-sm"
                  placeholder="New task..."
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  required
                />
              </div>
              <div className="col-2">
                <select 
                  className="form-select form-select-sm"
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                >
                  <option value="low">L</option>
                  <option value="medium">M</option>
                  <option value="high">H</option>
                </select>
              </div>
              <div className="col-2">
                <div className="d-flex gap-1 h-100">
                  <button type="submit" className="btn btn-success btn-sm px-2 flex-grow-1">Add</button>
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary btn-sm px-1" 
                    onClick={() => setShowNewTask(false)}
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          </form>
        ) : (
          <button 
            className="btn btn-outline-primary btn-sm w-100 text-start"
            onClick={() => setShowNewTask(true)} 
          >
            <i className="bi bi-plus-circle me-1"></i>Add task
          </button>
        )}
      </div>
    </div>
  );
};

export default ListColumn;
