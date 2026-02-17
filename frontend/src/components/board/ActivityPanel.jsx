import React from "react";

const ActivityPanel = ({ activities = [] }) => {
  return (
    <div className="card h-100 sticky-top" style={{top: '1rem'}}>
      <div className="card-header bg-light border-bottom">
        <h6 className="mb-0 fw-semibold">
          <i className="bi bi-clock-history me-2"></i>Recent Activity
        </h6>
      </div>
      <div className="card-body p-0" style={{maxHeight: '500px', overflowY: 'auto'}}>
        {activities.length === 0 ? (
          <div className="text-center py-4 text-muted">
            <i className="bi bi-activity fs-1 opacity-50 mb-2 d-block"></i>
            <small>No activity yet</small>
          </div>
        ) : (
          <ul className="list-group list-group-flush list-group-hover">
            {activities.slice(0, 20).map((activity) => (
              <li key={activity._id} className="list-group-item px-3 py-2 border-0">
                <div className="d-flex align-items-start gap-2">
                  <div className="flex-shrink-0">
                    <div 
                      className="avatar avatar-sm rounded-circle bg-primary d-flex align-items-center justify-content-center text-white fw-bold fs-2xs"
                      style={{width: 32, height: 32}}
                    >
                      {activity.user?.username?.[0]?.toUpperCase() || '?'}
                    </div>
                  </div>
                  <div className="flex-grow-1">
                    <div className="small fw-semibold text-truncate">
                      {activity.user?.username || 'Someone'}
                    </div>
                    <div className="small text-muted">
                      {formatActivityMessage(activity)}
                    </div>
                    <div className="small text-black-50">
                      {new Date(activity.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

// Helper to format activity messages
const formatActivityMessage = (activity) => {
  const messages = {
    'board_created': 'created this board',
    'list_created': 'created a list',
    'task_created': 'created a task',
    'task_moved': 'moved a task',
    'task_updated': 'updated a task',
    'member_added': 'added a member',
    'list_deleted': 'deleted a list',
    'task_deleted': 'deleted a task'
  };
  return messages[activity.type] || activity.type.replace('_', ' ').toLowerCase();
};

export default ActivityPanel;
