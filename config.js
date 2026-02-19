import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Firebase configuration
// Get from environment variables or use default placeholder values
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ||"AIzaSyDbLPqDHh8deqZ5A1Ux1YLgSydEqQCd6b8"
,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "my-todo-app-6b9e3.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "my-todo-app-6b9e3",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "my-todo-app-6b9e3.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ||"474412883682"
 ,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:474412883682:web:d13c6522ba5a3d63b608bb",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://my-todo-app-6b9e3-default-rtdb.firebaseio.com/" // For Realtime Database
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const realtimeDb = getDatabase(app);
export const messaging = typeof window !== 'undefined' ? getMessaging(app) : null;

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

// Request notification permission and get token
export const requestNotificationPermission = async () => {
  if (!messaging) return null;
  
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY || "BMkcOuZpBI4L-Q2e0uthLCZ9SOUqR7GXivQxJn5u9tkYyeSvsAK-StPurg1LFPj81wG9UYYyXuFA6cY4WfymQHs" // Get this from Firebase Console > Cloud Messaging
      });
      return token;
    }
    return null;
  } catch (error) {
    console.error('Error getting notification token:', error);
    return null;
  }
};

// Listen for foreground messages
export const onMessageListener = () => {
  if (!messaging) return Promise.resolve({});
  
  return new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
};

export default app;

