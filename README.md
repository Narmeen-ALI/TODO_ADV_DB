# 📝 Collaborative Todo App

A real-time collaborative todo/task management application built with React and Firebase.

## ✨ Features

- 🔐 **Google Sign In Authentication** - Secure authentication with Google
- 📝 **Personal & Shared Task Lists** - Create personal tasks and share with others
- ⚡ **Real-time Updates** - See changes instantly using Firestore listeners
- 🔔 **Push Notifications** - Get notified when tasks are assigned to you
- 🏷️ **Categories/Tags** - Organize tasks with categories and tags
- 📅 **Due Dates & Priority Levels** - Set due dates and priority (High/Medium/Low)
- 👤 **User Profile with Avatar** - View and manage your profile
- 💾 **Firestore Database** - Cloud Firestore for data storage
- 🔥 **Realtime Database (Bonus)** - Firebase Realtime DB for presence tracking

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase account

### Installation

1. **Clone the repository and install dependencies:**
```bash
npm install
```

2. **Create a `.env` file in the root directory:**
```bash
cp .env.example .env
```

3. **Add your Firebase configuration to `.env`:**
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_DATABASE_URL=your_database_url
VITE_FIREBASE_VAPID_KEY=your_vapid_key
```

4. **Run the development server:**
```bash
npm run dev
```

5. **Build for production:**
```bash
npm run build
```

## 🔥 Firebase Setup

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project"
3. Enter project name and follow the setup wizard

### Step 2: Enable Authentication

1. Go to **Authentication** > **Sign-in method**
2. Enable **Google** sign-in provider
3. Add your project's support email
4. Save the configuration

### Step 3: Create Firestore Database

1. Go to **Firestore Database**
2. Click "Create database"
3. Start in **test mode** (or set up security rules)
4. Choose a location for your database

### Step 4: Create Realtime Database (Optional - for bonus features)

1. Go to **Realtime Database**
2. Click "Create database"
3. Start in **test mode**
4. Choose a location

### Step 5: Enable Cloud Messaging

1. Go to **Cloud Messaging**
2. Generate a **Web Push certificate** (VAPID key)
3. Copy the VAPID key to your `.env` file

### Step 6: Get Firebase Configuration

1. Go to **Project Settings** (gear icon)
2. Scroll down to "Your apps"
3. Click the web icon (`</>`) to add a web app
4. Copy the Firebase configuration object
5. Add the values to your `.env` file

### Step 7: Firestore Security Rules (Recommended)

Update your Firestore rules in the Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Tasks: users can create tasks, read their own and assigned tasks
    match /tasks/{taskId} {
      allow create: if request.auth != null;
      allow read: if request.auth != null && 
        (resource.data.ownerId == request.auth.uid || 
         request.auth.uid in resource.data.assignedTo);
      allow update, delete: if request.auth != null && 
        resource.data.ownerId == request.auth.uid;
    }
    
    // Notifications: users can read their own notifications
    match /notifications/{notificationId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
  }
}
```

### Step 8: Realtime Database Rules (Optional)

Update your Realtime Database rules:

```json
{
  "rules": {
    "status": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    },
    "activities": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    },
    "tasks": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
```

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── Dashboard.jsx    # Main dashboard with task list
│   ├── Login.jsx        # Login page
│   ├── Profile.jsx     # User profile page
│   ├── TaskForm.jsx    # Task creation/editing form
│   ├── TaskItem.jsx    # Individual task component
│   └── TaskList.jsx    # Task list component
├── contexts/           # React contexts
│   └── AuthContext.jsx # Authentication context
├── firebase/           # Firebase configuration
│   └── config.js       # Firebase setup
├── services/           # Service modules
│   ├── taskService.js  # Firestore task operations
│   ├── notificationService.js  # Push notifications
│   └── realtimeService.js      # Realtime DB operations
├── App.jsx             # Main app component
└── main.jsx            # App entry point
```

## 🎯 Usage

1. **Sign In**: Click "Sign in with Google" to authenticate
2. **Create Task**: Click "+ New Task" to create a new task
3. **Assign Tasks**: Select users from the assignee list when creating/editing tasks
4. **Filter Tasks**: Use the filter buttons to view All, Personal, Shared, or Completed tasks
5. **Complete Tasks**: Check the checkbox to mark tasks as complete
6. **Edit/Delete**: Click edit or delete icons (only for tasks you own)
7. **View Profile**: Click your avatar to view your profile

## 🔔 Push Notifications

Push notifications are automatically set up when you:
1. Sign in to the app
2. Grant notification permissions
3. Get assigned a task by another user

Notifications will appear even when the app is in the background.

## 🛠️ Technologies Used

- **React 18** - UI library
- **Firebase 10** - Backend services
  - Authentication
  - Firestore
  - Realtime Database
  - Cloud Messaging
- **React Router** - Navigation
- **date-fns** - Date formatting
- **Vite** - Build tool

## 📝 License

This project is open source and available for educational purposes.


