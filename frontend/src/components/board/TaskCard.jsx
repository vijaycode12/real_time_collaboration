import React from "react";

const TaskCard = ({ task }) => {
  return (
    <div className="card task-card border-0 bg-white hover:shadow-lg transition-all overflow-hidden">
      <div className="card-body p-3">
       
        <div className="drag-handle mb-2 opacity-75 hover:opacity-100 transition-opacity d-flex align-items-center">
          <i className="bi bi-grip-vertical fs-5 text-muted me-1"></i>
          <small className="text-muted">Drag</small>
        </div>

        
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div className="flex-grow-1 pe-3">
            <h6 className="card-title mb-1 fw-semibold lh-sm text-break">
              {task.title}
            </h6>
            {task.description && (
              <p className="card-text mb-2 small text-muted lh-sm text-break">
                {task.description.length > 100 
                  ? `${task.description.slice(0, 100)}...` 
                  : task.description
                }
              </p>
            )}
          </div>

         
          {task.priority && (
            <span className={`badge fs-2xs fw-semibold px-2 py-1 ${
              task.priority === 'high' ? 'bg-danger' :
              task.priority === 'medium' ? 'bg-warning text-dark' : 'bg-success'
            }`}>
              {task.priority.toUpperCase()}
            </span>
          )}
        </div>

        
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-1">
          
          {task.assignees && task.assignees.length > 0 && (
            <div className="d-flex gap-1">
              {task.assignees.slice(0, 2).map((assignee, index) => (
                <div
                  key={assignee._id || index}
                  className="avatar avatar-xs bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
                  style={{ width: 24, height: 24, fontSize: '0.65rem' }}
                >
                  {assignee.username?.[0]?.toUpperCase() || '?'}
                </div>
              ))}
              {task.assignees.length > 2 && (
                <div className="avatar avatar-xs bg-secondary text-white d-flex align-items-center justify-content-center fw-bold"
                     style={{ width: 24, height: 24, fontSize: '0.65rem' }}>
                  +{task.assignees.length - 2}
                </div>
              )}
            </div>
          )}

          
          <div className="dropdown">
            <button 
              className="btn btn-sm btn-outline-secondary p-1 rounded-circle" 
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <i className="bi bi-three-dots-vertical fs-6"></i>
            </button>
            <ul className="dropdown-menu dropdown-menu-end shadow">
              <li>
                <button className="dropdown-item d-flex align-items-center gap-2" type="button">
                  <i className="bi bi-pencil"></i>
                  Edit
                </button>
              </li>
              <li>
                <button className="dropdown-item d-flex align-items-center gap-2" type="button">
                  <i className="bi bi-person-plus"></i>
                  Assign
                </button>
              </li>
              <li>
                <button className="dropdown-item d-flex align-items-center gap-2" type="button">
                  <i className="bi bi-arrow-right-circle"></i>
                  Move
                </button>
              </li>
              <li><hr className="dropdown-divider" /></li>
              <li>
                <button className="dropdown-item d-flex align-items-center gap-2 text-danger" type="button">
                  <i className="bi bi-trash"></i>
                  Delete
                </button>
              </li>
            </ul>
          </div>
        </div>

        
        <div className="mt-2 pt-2 border-top border-light">
          <small className="text-muted">
            <i className="bi bi-clock me-1"></i>
            {task.createdAt ? new Date(task.createdAt).toLocaleDateString() : 'No date'}
          </small>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
