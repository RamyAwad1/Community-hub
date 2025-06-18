
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { usersApi } from '../src/utils/api.js'; 
import { useNavigate } from 'react-router-dom'; 

const UserProfilePage = () => {
  const { user, isAuthenticated, isLoading, getAccessTokenSilently, logout } = useAuth();
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState({ name: '', email: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [updateMessage, setUpdateMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Effect to fetch user profile from backend when component mounts or user changes
  useEffect(() => {
    const fetchProfile = async () => {
      if (isAuthenticated && user) {
        setLoadingProfile(true);
        setErrorMessage('');
        try {
          // Fetch the user's profile from our backend API
          const fetchedProfile = await usersApi.getUserProfile(getAccessTokenSilently);
          setProfileData({
            name: fetchedProfile.name || '',
            email: fetchedProfile.email || '',
            // Add other fields from your backend user object if available
          });
          setLoadingProfile(false);
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setErrorMessage("Failed to load profile. Please try again.");
          setLoadingProfile(false);
          // If 401/403, might need to redirect to login
          if (error.message.includes('401') || error.message.includes('403')) {
            logout(); // Log out if unauthorized
            navigate('/login');
          }
        }
      } else {
        // If not authenticated or user object is null, set loading to false and clear data
        setLoadingProfile(false);
        setProfileData({ name: '', email: '' });
      }
    };

    fetchProfile();
  }, [isAuthenticated, user, getAccessTokenSilently, navigate, logout]); // Depend on isAuthenticated, user, getAccessTokenSilently

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setUpdateMessage('');
    setErrorMessage('');
    setLoadingProfile(true); // Indicate saving process

    try {
      const updatedBackendUser = await usersApi.updateUserProfile(profileData, getAccessTokenSilently);
      setProfileData({
        name: updatedBackendUser.name || '',
        email: updatedBackendUser.email || '',
      });
      setUpdateMessage('Profile updated successfully!');
      setIsEditing(false); // Exit edit mode
    } catch (error) {
      console.error("Error updating profile:", error);
      setErrorMessage(error.message || "Failed to update profile. Please try again.");
    } finally {
      setLoadingProfile(false);
    }
  };

  if (isLoading || loadingProfile) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl text-gray-700">Loading user profile...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
        <p className="text-gray-700">Please log in to view your profile.</p>
        <button
          onClick={() => navigate('/login')}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition duration-300"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8 flex items-start justify-center">
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-md mt-10">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-6">Your Profile</h2>

        {errorMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{errorMessage}</span>
          </div>
        )}
        {updateMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{updateMessage}</span>
          </div>
        )}

        <form onSubmit={handleSave}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={profileData.name}
              onChange={handleInputChange}
              readOnly={!isEditing}
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${isEditing ? 'bg-white' : 'bg-gray-50'}`}
            />
          </div>

          <div className="mb-6">
            <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={profileData.email}
              onChange={handleInputChange}
              readOnly={!isEditing}
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${isEditing ? 'bg-white' : 'bg-gray-50'}`}
            />
          </div>

          {/* Display role from backend user object */}
          {user && user.role && (
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">Role:</label>
              <p className="text-gray-800 text-lg font-semibold">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
            </div>
          )}

          <div className="flex items-center justify-between">
            {isEditing ? (
              <>
                <button
                  type="submit"
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300"
                  disabled={loadingProfile}
                >
                  {loadingProfile ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setUpdateMessage(''); // Clear messages on cancel
                    setErrorMessage('');
                    // Re-fetch original profile data if user cancels editing
                    // This is a quick way to revert changes without re-calling API if not necessary
                    if (user) {
                      setProfileData({
                        name: user.name || '',
                        email: user.email || '',
                      });
                    }
                  }}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsEditing(true);
                  setUpdateMessage(''); // Clear messages when entering edit mode
                  setErrorMessage('');
                }}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300"
              >
                Edit Profile
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserProfilePage;