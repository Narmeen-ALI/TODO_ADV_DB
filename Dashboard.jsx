import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getAllTasks, createTask, updateTask, deleteTask, getAllUsers } from '../services/taskService';
import { setupNotifications, createTaskNotification, setupForegroundNotifications, listenForNotifications } from '../services/notificationService';
import { setUserPresence } from '../services/realtimeService';
import TaskList from './TaskList';
import TaskForm from './TaskForm';
import './Dashboard.css';

const Dashboard = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all'); // all, personal, shared, completed
  const [users, setUsers] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    if (!currentUser) return;

    // Setup notifications
    setupNotifications(currentUser.uid);
    setupForegroundNotifications((payload) => {
      console.log('Foreground notification:', payload);
    });

    // Setup real-time notification listener
    console.log('🔔 Starting notification listener for user:', currentUser.uid);
    const notificationUnsubscribe = listenForNotifications(currentUser.uid, (notification) => {
      console.log('🔔 Notification received in Dashboard:', notification);
    });

    // Setup real-time presence
    setUserPresence(currentUser.uid, true);

    // Get all users for task assignment
    getAllUsers().then(setUsers);

    // Subscribe to real-time task updates
    const tasksUnsubscribe = getAllTasks(currentUser.uid, (updatedTasks) => {
      setTasks(updatedTasks);
    });

    // Cleanup function
    return () => {
      console.log('🔔 Cleaning up notification listener');
      if (tasksUnsubscribe) tasksUnsubscribe();
      if (notificationUnsubscribe) notificationUnsubscribe();
      setUserPresence(currentUser.uid, false);
    };
  }, [currentUser]);

  const handleCreateTask = async (taskData) => {
    try {
      const taskId = await createTask({
        ...taskData,
        ownerId: currentUser.uid,
        ownerName: currentUser.displayName,
        ownerPhotoURL: currentUser.photoURL,
        completed: false,
        assignedTo: taskData.assignedTo || []
      });

      // Create notification for assigned users
      if (taskData.assignedTo && taskData.assignedTo.length > 0) {
        console.log('📤 Sending notifications to:', taskData.assignedTo);
        taskData.assignedTo.forEach((userId) => {
          if (userId !== currentUser.uid) {
            createTaskNotification(
              taskId,
              userId,
              taskData.title,
              currentUser.displayName
            );
          }
        });
      }

      setShowForm(false);
      setSelectedTask(null);
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Failed to create task. Please try again.');
    }
  };

  const handleUpdateTask = async (taskId, updates) => {
    try {
      await updateTask(taskId, updates);
      setSelectedTask(null);
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Failed to update task. Please try again.');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(taskId);
      } catch (error) {
        console.error('Error deleting task:', error);
        alert('Failed to delete task. Please try again.');
      }
    }
  };

  const handleToggleComplete = async (task) => {
    await handleUpdateTask(task.id, { completed: !task.completed });
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Filter and sort tasks
  const filteredTasks = tasks
    .filter((task) => {
      if (filter === 'personal') {
        return task.ownerId === currentUser?.uid;
      }
      if (filter === 'shared') {
        return task.assignedTo && task.assignedTo.includes(currentUser?.uid) && task.ownerId !== currentUser?.uid;
      }
      if (filter === 'completed') {
        return task.completed === true;
      }
      return true;
    })
    .sort((a, b) => {
      // ✅ COMPLETED TASKS GO TO BOTTOM
      if (a.completed && !b.completed) return 1;
      if (!a.completed && b.completed) return -1;
      
      // 🔴 For uncompleted tasks, sort by PRIORITY (High > Medium > Low)
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      const aPriority = priorityOrder[a.priority?.toLowerCase()] ?? 2;
      const bPriority = priorityOrder[b.priority?.toLowerCase()] ?? 2;
      
      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }
      
      // 📅 If same priority, sort by DUE DATE (earliest first)
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate) - new Date(b.dueDate);
      }
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      
      // 🕐 Finally, sort by CREATION TIME (newest first)
      return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
    });

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>📝 My Tasks</h1>
          <div className="header-actions">
            <button
              onClick={() => {
                setShowForm(true);
                setSelectedTask(null);
              }}
              className="btn-primary"
            >
              + New Task
            </button>
            <button onClick={() => navigate('/profile')} className="btn-profile">
              <img
                src={currentUser?.photoURL || '/default-avatar.png'}
                alt={currentUser?.displayName}
                className="avatar-small"
              />
            </button>
            <button onClick={handleLogout} className="btn-logout">
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="filters">
          <button
            onClick={() => setFilter('all')}
            className={filter === 'all' ? 'active' : ''}
          >
            All Tasks
          </button>
          <button
            onClick={() => setFilter('personal')}
            className={filter === 'personal' ? 'active' : ''}
          >
            Personal
          </button>
          <button
            onClick={() => setFilter('shared')}
            className={filter === 'shared' ? 'active' : ''}
          >
            Shared with Me
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={filter === 'completed' ? 'active' : ''}
          >
            Completed
          </button>
        </div>

        <TaskList
          tasks={filteredTasks}
          currentUser={currentUser}
          onToggleComplete={handleToggleComplete}
          onUpdate={handleUpdateTask}
          onDelete={handleDeleteTask}
          onEdit={(task) => {
            setSelectedTask(task);
            setShowForm(true);
          }}
        />

        {showForm && (
          <TaskForm
            task={selectedTask}
            users={users}
            currentUser={currentUser}
            onSubmit={selectedTask ? handleUpdateTask : handleCreateTask}
            onCancel={() => {
              setShowForm(false);
              setSelectedTask(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
