import React from 'react';
import { format } from 'date-fns';
import './TaskItem.css';

const TaskItem = ({ task, currentUser, onToggleComplete, onUpdate, onDelete, onEdit }) => {
  const isOwner = task.ownerId === currentUser?.uid;
  const isAssigned = task.assignedTo && task.assignedTo.includes(currentUser?.uid);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return '#f44336';
      case 'medium':
        return '#ff9800';
      case 'low':
        return '#4caf50';
      default:
        return '#9e9e9e';
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      work: '#2196F3',
      personal: '#9C27B0',
      shopping: '#FF5722',
      health: '#4CAF50',
      other: '#9E9E9E'
    };
    return colors[category] || colors.other;
  };

  return (
    <div className={`task-item ${task.completed ? 'completed' : ''}`}>
      <div className="task-checkbox">
        <input
          type="checkbox"
          checked={task.completed || false}
          onChange={() => onToggleComplete(task)}
        />
      </div>

      <div className="task-content">
        <div className="task-header">
          <h3 className="task-title">{task.title}</h3>
          <div className="task-actions">
            {isOwner && (
              <button onClick={() => onEdit(task)} className="btn-edit">
                ✏️
              </button>
            )}
            {isOwner && (
              <button onClick={() => onDelete(task.id)} className="btn-delete">
                🗑️
              </button>
            )}
          </div>
        </div>

        {task.description && (
          <p className="task-description">{task.description}</p>
        )}

        <div className="task-meta">
          {task.category && (
            <span
              className="task-category"
              style={{ backgroundColor: getCategoryColor(task.category) }}
            >
              {task.category}
            </span>
          )}

          {task.tags && task.tags.length > 0 && (
            <div className="task-tags">
              {task.tags.map((tag, index) => (
                <span key={index} className="task-tag">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {task.priority && (
            <span
              className="task-priority"
              style={{ color: getPriorityColor(task.priority) }}
            >
              ⚡ {task.priority}
            </span>
          )}

          {task.dueDate && (
            <span
              className={`task-due-date ${
                new Date(task.dueDate) < new Date() && !task.completed
                  ? 'overdue'
                  : ''
              }`}
            >
              📅 {format(new Date(task.dueDate), 'MMM dd, yyyy')}
            </span>
          )}
        </div>

        <div className="task-footer">
          <div className="task-owner">
            <img
              src={task.ownerPhotoURL || '/default-avatar.png'}
              alt={task.ownerName}
              className="owner-avatar"
            />
            <span>{task.ownerName}</span>
            {!isOwner && <span className="shared-badge">Shared</span>}
          </div>

          {task.assignedTo && task.assignedTo.length > 0 && (
            <div className="assigned-users">
              <span>Assigned to: </span>
              {task.assignedTo.map((userId, index) => (
                <span key={userId} className="assigned-user">
                  User {index + 1}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskItem;

