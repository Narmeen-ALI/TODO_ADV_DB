import { collection, addDoc, serverTimestamp, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { requestNotificationPermission, onMessageListener } from '../firebase/config';

// Request notification permission and save token
export const setupNotifications = async (userId) => {
  try {
    const token = await requestNotificationPermission();
    if (token) {
      console.log('✅ Notification token:', token);
      localStorage.setItem('notificationToken', token);
      return token;
    }
    return null;
  } catch (error) {
    console.error('❌ Error setting up notifications:', error);
    return null;
  }
};

// Create a notification when task is assigned
export const createTaskNotification = async (taskId, assignedToUserId, taskTitle, ownerName) => {
  try {
    console.log('📤 Creating notification for user:', assignedToUserId);
    
    await addDoc(collection(db, 'notifications'), {
      userId: assignedToUserId,
      taskId: taskId,
      type: 'task_assigned',
      title: `New task assigned: ${taskTitle}`,
      message: `${ownerName} assigned you a task`,
      read: false,
      createdAt: serverTimestamp()
    });
    
    console.log('✅ Notification created in Firestore');
  } catch (error) {
    console.error('❌ Error creating notification:', error);
  }
};

// Listen for new notifications for current user (REAL-TIME!)
export const listenForNotifications = (userId, callback) => {
  try {
    console.log('🔔 Setting up real-time notification listener for user:', userId);
    
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      where('read', '==', false)
    );

    // ✅ FIX: isFirstLoad flag - purane notifications ignore karo
    let isFirstLoad = true;

    // Real-time listener - This will fire whenever a new notification is added
    const unsubscribe = onSnapshot(q, (snapshot) => {

      // ✅ FIX: Pehli baar app open hone pe sare purane notifications skip karo
      if (isFirstLoad) {
        isFirstLoad = false;
        console.log('⏭️ Skipping initial notifications load (old notifications ignored)');
        return;
      }

      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const notificationData = change.doc.data();
          
          console.log('🔔 NEW NOTIFICATION RECEIVED:', notificationData);
          
          // Show browser notification
          if ('Notification' in window && Notification.permission === 'granted') {
            console.log('🔔 Showing browser notification...');
            
            const notification = new Notification(notificationData.title || 'New Notification', {
              body: notificationData.message || 'You have a new notification',
              icon: '/vite.svg',
              badge: '/vite.svg',
              tag: notificationData.taskId || 'notification',
              requireInteraction: true
            });

            // Optional: Play sound
            notification.onclick = () => {
              window.focus();
              notification.close();
            };
          } else {
            console.log('⚠️ Notification permission not granted or not available');
          }
          
          // Call callback if provided
          if (callback) {
            callback(notificationData);
          }
        }
      });
    }, (error) => {
      console.error('❌ Error in notification listener:', error);
    });

    console.log('✅ Notification listener setup complete');
    return unsubscribe;
    
  } catch (error) {
    console.error('❌ Error setting up notification listener:', error);
    return null;
  }
};

// Listen for foreground messages (FCM - for future server-side push)
export const setupForegroundNotifications = (callback) => {
  onMessageListener()
    .then((payload) => {
      if (payload && payload.notification) {
        console.log('🔔 FCM Foreground notification:', payload);
        callback(payload);
        
        // Show browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(payload.notification.title, {
            body: payload.notification.body,
            icon: payload.notification.icon || '/vite.svg'
          });
        }
      }
    })
    .catch((err) => {
      console.error('❌ Error in FCM message listener:', err);
    });
};