import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { getUserPresence } from '../services/realtimeService';
import './Profile.css';

const Profile = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [presence, setPresence] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    const fetchUserData = async () => {
      try {
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUserData(userSnap.data());
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();

    // Get real-time presence
    const unsubscribe = getUserPresence(currentUser.uid, (status) => {
      setPresence(status);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <header className="profile-header">
        <button onClick={() => navigate('/dashboard')} className="back-btn">
          ← Back to Dashboard
        </button>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </header>

      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-avatar-section">
            <img
              src={currentUser?.photoURL || '/default-avatar.png'}
              alt={currentUser?.displayName}
              className="profile-avatar"
            />
            <div className="presence-indicator">
              {presence?.online ? (
                <span className="online">● Online</span>
              ) : (
                <span className="offline">○ Offline</span>
              )}
            </div>
          </div>

          <div className="profile-info">
            <h1>{currentUser?.displayName || 'User'}</h1>
            <p className="email">{currentUser?.email}</p>

            <div className="profile-details">
            
<div className="detail-item">
  <span className="label">Name:</span>
  <span className="value">{currentUser?.displayName || 'User'}</span>
</div>

              {userData?.createdAt && (
                <div className="detail-item">
                  <span className="label">Member since:</span>
                  <span className="value">
                    {new Date(userData.createdAt).toLocaleDateString()}
                  </span>
                </div>
              )}

              {presence?.lastSeen && (
                <div className="detail-item">
                  <span className="label">Last seen:</span>
                  <span className="value">
                    {new Date(presence.lastSeen).toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            <div className="profile-stats">
              <h3>Account Information</h3>
              <p>This is your profile page. You can view your account details here.</p>
              <p>
                <strong>Provider:</strong> Google Authentication
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

