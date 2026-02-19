import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import { db } from '../firebase/config';

// Create a task
export const createTask = async (taskData) => {
  try {
    const taskRef = await addDoc(collection(db, 'tasks'), {
      ...taskData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return taskRef.id;
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};

// Update a task
export const updateTask = async (taskId, updates) => {
  try {
    const taskRef = doc(db, 'tasks', taskId);
    await updateDoc(taskRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
};

// Delete a task
export const deleteTask = async (taskId) => {
  try {
    const taskRef = doc(db, 'tasks', taskId);
    await deleteDoc(taskRef);
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
};

// Get tasks for a user (personal tasks)
export const getUserTasks = (userId, callback) => {
  const q = query(
    collection(db, 'tasks'),
    where('ownerId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const tasks = [];
    snapshot.forEach((doc) => {
      tasks.push({ id: doc.id, ...doc.data() });
    });
    callback(tasks);
  });
};

// Get shared tasks (tasks assigned to user)
export const getSharedTasks = (userId, callback) => {
  const q = query(
    collection(db, 'tasks'),
    where('assignedTo', 'array-contains', userId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const tasks = [];
    snapshot.forEach((doc) => {
      tasks.push({ id: doc.id, ...doc.data() });
    });
    callback(tasks);
  });
};

// Get all tasks (personal + shared)
export const getAllTasks = (userId, callback) => {
  const tasksRef = collection(db, 'tasks');
  const q = query(tasksRef, orderBy('createdAt', 'desc'));

  return onSnapshot(q, (snapshot) => {
    const tasks = [];
    snapshot.forEach((doc) => {
      const task = { id: doc.id, ...doc.data() };
      // Filter tasks that belong to user or are assigned to user
      if (task.ownerId === userId || (task.assignedTo && task.assignedTo.includes(userId))) {
        tasks.push(task);
      }
    });
    callback(tasks);
  });
};
// Get all users for task assignment
export const getAllUsers = async () => {
  try {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    const users = [];
    snapshot.forEach((doc) => {
      const userData = { id: doc.id, ...doc.data() };
      
      // ✅ Filter: Only add active users
      if (userData.isActive !== false) {
        users.push(userData);
      }
    });
    return users;
  } catch (error) {
    console.error('Error getting users:', error);
    throw error;
  }
};