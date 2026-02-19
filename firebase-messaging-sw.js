// Service Worker for Firebase Cloud Messaging
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Initialize Firebase in the service worker
// Note: Replace with your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDbLPqDHh8deqZ5A1Ux1YLgSydEqQCd6b8",
  authDomain: "my-todo-app-6b9e3.firebaseapp.com",
  projectId: "my-todo-app-6b9e3",
  storageBucket: "my-todo-app-6b9e3.firebasestorage.app",
  messagingSenderId: "474412883682",
  appId: "1:474412883682:web:d13c6522ba5a3d63b608bb",
databaseURL:"https://my-todo-app-6b9e3-default-rtdb.firebaseio.com"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Background message received:', payload);
  
  const notificationTitle = payload.notification?.title || 'New Notification';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new notification',
    icon: payload.notification?.icon || '/icon-192x192.png',
    badge: '/icon-192x192.png',
    tag: payload.data?.taskId || 'default',
    requireInteraction: true
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/dashboard')
  );
});

