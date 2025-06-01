// src/context/AuthContext.jsx

import { createContext, useContext } from 'react';
import { useAuth0 } from '@auth0/auth0-react'; // Make sure you have installed @auth0/auth0-react

const AuthContext = createContext(); // This initializes your custom AuthContext

export const AuthProvider = ({ children }) => {
  // This hook relies on Auth0Provider being a parent component in your tree (see main.jsx)
  const { user, isAuthenticated, isLoading, loginWithRedirect, logout } = useAuth0();

  // Create the value object that will be passed to components using useAuth()
  const authContextValue = {
    user: user || null, // Ensure user is null if not authenticated/loading
    isAuthenticated,
    isLoading,
    loginWithRedirect,
    logout,
  };

  return (
    // AuthContext.Provider makes the authContextValue available to all its children
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// This is your custom hook that components like Nav and LoginPage will use
export const useAuth = () => {
  const context = useContext(AuthContext);
  // Optional: Add a check here for better error messages
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};