import { ref, set, onValue, off, push, update, remove, onDisconnect } from 'firebase/database';
import { realtimeDb } from '../firebase/config';

// Real-time presence tracking
export const setUserPresence = (userId, isOnline) => {
  const userStatusRef = ref(realtimeDb, `status/${userId}`);
  const connectedRef = ref(realtimeDb, '.info/connected');
  
  onValue(connectedRef, (snapshot) => {
    if (snapshot.val() === false) {
      return;
    }

    // Set user as online
    set(userStatusRef, {
      online: true,
      lastSeen: new Date().toISOString()
    });

    // ✅ FIX: When user disconnects, automatically set offline
    onDisconnect(userStatusRef).set({
      online: false,
      lastSeen: new Date().toISOString()
    });
  });
};

// Get user presence
export const getUserPresence = (userId, callback) => {
  const userStatusRef = ref(realtimeDb, `status/${userId}`);
  
  onValue(userStatusRef, (snapshot) => {
    const status = snapshot.val();
    callback(status);
  });

  return () => off(userStatusRef);
};

// Real-time activity feed
export const addActivity = (userId, activity) => {
  const activitiesRef = ref(realtimeDb, `activities/${userId}`);
  push(activitiesRef, {
    ...activity,
    timestamp: new Date().toISOString()
  });
};

// Get real-time activities
export const getActivities = (userId, callback) => {
  const activitiesRef = ref(realtimeDb, `activities/${userId}`);
  
  onValue(activitiesRef, (snapshot) => {
    const activities = [];
    snapshot.forEach((childSnapshot) => {
      activities.push({
        id: childSnapshot.key,
        ...childSnapshot.val()
      });
    });
    // Sort by timestamp (newest first)
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    callback(activities);
  });

  return () => off(activitiesRef);
};

// Real-time task updates (alternative to Firestore)
export const createRealtimeTask = (taskData) => {
  const tasksRef = ref(realtimeDb, 'tasks');
  return push(tasksRef, {
    ...taskData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
};

export const updateRealtimeTask = (taskId, updates) => {
  const taskRef = ref(realtimeDb, `tasks/${taskId}`);
  update(taskRef, {
    ...updates,
    updatedAt: new Date().toISOString()
  });
};

export const deleteRealtimeTask = (taskId) => {
  const taskRef = ref(realtimeDb, `tasks/${taskId}`);
  remove(taskRef);
};

export const getRealtimeTasks = (callback) => {
  const tasksRef = ref(realtimeDb, 'tasks');
  
  onValue(tasksRef, (snapshot) => {
    const tasks = [];
    snapshot.forEach((childSnapshot) => {
      tasks.push({
        id: childSnapshot.key,
        ...childSnapshot.val()
      });
    });
    callback(tasks);
  });

  return () => off(tasksRef);
};