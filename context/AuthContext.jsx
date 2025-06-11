
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import * as mockApi from '../api/mockApi.js'; 
const AuthContext = createContext(null);

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  
  const {
    isAuthenticated,      
    user: auth0User,      // The user object provided by Auth0 (e.g., { sub: 'auth0|...', name: '...', email: '...' })
    loginWithRedirect,    
    logout: auth0Logout,  
    isLoading: auth0IsLoading, 
    getAccessTokenSilently, // Function to get access token for secured APIs
  } = useAuth0();

  // combining Auth0 data with mock API roles
  const [appUser, setAppUser] = useState(null);
  // Our application's loading state, which includes Auth0's loading and our own processing
  const [appIsLoading, setAppIsLoading] = useState(true);

  // useEffect to process Auth0 user data and set our app's user state
  useEffect(() => {
    const processAuth0User = async () => {
      // If Auth0 SDK is still initializing or checking session, the app is also loading
      if (auth0IsLoading) {
        setAppIsLoading(true);
        return;
      }

      // If Auth0 has successfully authenticated a user
      if (isAuthenticated && auth0User) {
        let role = 'user'; // Default role for any new user
        let userId = auth0User.sub; // Auth0's unique user ID 
        let userName = auth0User.name || auth0User.nickname || auth0User.email || 'Guest';
        let userEmail = auth0User.email;

        // Try to fetch user from our mock database using their Auth0 ID (sub)
        let existingMockUser = await mockApi.fetchUserById(userId);

        if (existingMockUser) {
          // If the user already exists in our mock database, use their stored role and info
          role = existingMockUser.role;
          userName = existingMockUser.name || userName; // Prefer mock data's name if available
          userEmail = existingMockUser.email || userEmail; // Prefer mock data's email
        } else {
          // This is a brand new Auth0 user (not yet in our mock DB).
          // Assign role based on special emails for testing purposes, otherwise default to 'user'.
          if (userEmail === 'organizer@example.com') {
            role = 'organizer';
          } else if (userEmail === 'admin@example.com') {
            role = 'admin';
          }
          // Add this new user to our mock API's user list with their Auth0 'sub' as ID
          // mockApi.updateUser acts as an "upsert" (creates if not exists).
          existingMockUser = await mockApi.updateUser(userId, {
            id: userId,
            name: userName,
            email: userEmail,
            role: role, // Assign the determined role
          });
          role = existingMockUser.role; // Confirm role from the upserted user
        }

        // Set our app's internal user state
        setAppUser({
          id: userId,
          name: userName,
          email: userEmail,
          role: role,
          // You can include other Auth0 user properties if needed, e.g.:
          // picture: auth0User.picture,
          // You might also want to store tokens if you plan to call external APIs
        });
      } else {
        // If not authenticated, clear our app's user state
        setAppUser(null);
      }
      // Finished processing Auth0 state, so our app is no longer in its initial loading phase
      setAppIsLoading(false);
    };

    processAuth0User();
  }, [auth0IsLoading, isAuthenticated, auth0User, getAccessTokenSilently]); // Dependencies for this effect

  // Define the login function for your app, which uses Auth0's loginWithRedirect
  const login = async () => {
    // This will redirect the user to Auth0's Universal Login page.
    // The redirect_uri is configured in main.jsx.
    await loginWithRedirect();
  };

  // Define the logout function for your app, which uses Auth0's logout
  const logout = async () => {
    // Auth0's logout function will clear the session and redirect back to your app.
    // The returnTo URL is configured in main.jsx (or can be passed here).
    await auth0Logout({ logoutParams: { returnTo: window.location.origin } });
    // Also clear our local app user state immediately
    setAppUser(null);
  };

  // Function to get user role (now directly from our appUser state)
  const getUserRole = () => appUser?.role;

  // Function to update user profile information in mock API
  const updateUserProfile = async (newProfileData) => {
    if (!appUser) {
      console.error("Cannot update profile: No user logged in.");
      return;
    }
    setAppIsLoading(true);
    try {
      // Update the user in our mock database using their Auth0 ID
      const updatedUser = await mockApi.updateUser(appUser.id, {
        ...appUser, // Start with current appUser data
        ...newProfileData // Overlay with new data
      });
      setAppUser(updatedUser); // Update our app's user state
    } catch (error) {
      console.error("Failed to update user profile in mock API:", error);
      throw error; // Re-throw to allow component to handle
    } finally {
      setAppIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: appUser,          // Our app's processed user object
        isAuthenticated,      // From Auth0
        isLoading: appIsLoading, // Our app's combined loading state
        login,                
        logout,               
        getUserRole,          
        updateUserProfile,    
        // You can expose Auth0 specific methods like getAccessTokenSilently if needed elsewhere:
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};