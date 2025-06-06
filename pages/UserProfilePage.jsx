import React, { useState, useEffect } from 'react';
import Layout from '../layout/Layout.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import '../css/UserProfilePage.css'; 

const UserProfilePage = () => {
  const { user, updateUser, isLoading } = useAuth(); // 'updateUser' comes from AuthContext
  const [editableUser, setEditableUser] = useState({
    name: '',
    email: '',
    nickname: '',
    bio: '', // Example: Added a 'bio' field for editing
  });
  const [isEditing, setIsEditing] = useState(false);
  const [saveStatus, setSaveStatus] = useState(''); // For messages like "Saved!"

  useEffect(() => {
    if (user) {
      // Initialize editableUser state with current user data from context
      setEditableUser({
        name: user.name || '',
        email: user.email || '',
        nickname: user.nickname || '',
        bio: user.bio || '',
      });
    }
  }, [user]); // Re-run this effect if the 'user' object in AuthContext changes

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditableUser(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaveStatus('Saving...');
    try {
      // Call the updateUser function from AuthContext to simulate saving
      await updateUser(editableUser);
      setSaveStatus('Profile updated successfully!');
      setIsEditing(false); // Exit editing mode after successful save
    } catch (error) {
      console.error('Failed to update profile:', error);
      setSaveStatus('Failed to update profile.');
    }
    // Clear the status message after a few seconds
    setTimeout(() => setSaveStatus(''), 3000);
  };

  // Display loading state
  if (isLoading) {
    return <Layout><div className="profile-loading">Loading profile...</div></Layout>;
  }

  // Handle case where user data isn't available (e.g., if page accessed directly without login)
  if (!user) {
    return <Layout><div className="profile-not-found">Please log in to view your profile.</div></Layout>;
  }

  return (
    <Layout>
      <div className="profile-container">
        <h2>User Profile</h2>

        <form onSubmit={handleSave} className="profile-form">
          
          <div className="form-group">
            <label htmlFor="name">Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={editableUser.name}
              onChange={handleChange}
              readOnly={!isEditing} // Make read-only unless in editing mode
              className={isEditing ? '' : 'read-only'}
            />
          </div>

          {/* Email Field (typically read-only) */}
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={editableUser.email}
              onChange={handleChange}
              readOnly // Email is often read-only for security/authentication
              className="read-only"
            />
          </div>

         
          <div className="form-group">
            <label htmlFor="nickname">Nickname:</label>
            <input
              type="text"
              id="nickname"
              name="nickname"
              value={editableUser.nickname}
              onChange={handleChange}
              readOnly={!isEditing}
              className={isEditing ? '' : 'read-only'}
            />
          </div>

          {/* Bio Field (as a textarea) */}
          <div className="form-group">
            <label htmlFor="bio">Bio:</label>
            <textarea
              id="bio"
              name="bio"
              value={editableUser.bio}
              onChange={handleChange}
              readOnly={!isEditing}
              className={isEditing ? '' : 'read-only'}
            ></textarea>
          </div>

          {/* Action Buttons (Edit/Save/Cancel) */}
          <div className="profile-actions">
            {!isEditing ? (
              // Show 'Edit Profile' button when not editing
              <button type="button" onClick={() => setIsEditing(true)} className="btn primary-btn">
                Edit Profile
              </button>
            ) : (
              // Show 'Save Changes' and 'Cancel' buttons when editing
              <>
                <button type="submit" className="btn primary-btn">
                  Save Changes
                </button>
                <button type="button" onClick={() => {
                  setIsEditing(false);
                  // Revert changes if 'Cancel' is clicked
                  setEditableUser({
                    name: user.name || '',
                    email: user.email || '',
                    nickname: user.nickname || '',
                    bio: user.bio || '',
                  });
                }} className="btn secondary-btn">
                  Cancel
                </button>
              </>
            )}
            {saveStatus && <p className="save-status">{saveStatus}</p>}
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default UserProfilePage;