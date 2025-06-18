import React, { createContext, useContext, useEffect, useState } from 'react';
import Cookies from 'js-cookie'; 
import { usersApi } from '../src/utils/api.js'; // Will use token directly

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [token, setToken] = useState(null);

  // On initial load, try to retrieve token and user profile
  useEffect(() => {
    const storedToken = Cookies.get('jwt_token') || localStorage.getItem('jwt_token');
    if (storedToken) {
      setToken(storedToken);
      setIsAuthenticated(true); // Optimistically authenticate
    }
    setIsLoading(false);
  }, []);

  // Fetch user profile when token/auth status changes
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (token && isAuthenticated) {
        setIsLoading(true);
        setAuthError(null);
        try {
          const profile = await usersApi.getUserProfile(token);
          setUser(profile);
          setIsAuthenticated(true);
          console.log("AuthContext: User profile loaded:", profile);
        } catch (error) {
          console.error("AuthContext: Error fetching user profile:", error);
          setAuthError(error.message || "Failed to load user profile.");
          handleLogout(); // Logout on profile fetch failure
        } finally {
          setIsLoading(false);
        }
      } else if (!token && !isLoading) {
        setUser(null);
        setIsAuthenticated(false);
        setAuthError(null);
        console.log("AuthContext: No token or not authenticated. Resetting state.");
      }
    };
    fetchUserProfile();
  }, [token, isAuthenticated]);

  // Login function
  const login = async (email, password) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Login failed.');

      Cookies.set('jwt_token', data.token, { expires: 1 });
      localStorage.setItem('jwt_token', data.token);
      setToken(data.token);
      setUser(data.user);
      setIsAuthenticated(true);
      console.log("AuthContext: Login successful!");
      return true;
    } catch (error) {
      console.error("AuthContext: Login error:", error);
      setAuthError(error.message || "Invalid credentials.");
      setUser(null);
      setIsAuthenticated(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (email, name, password) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Registration failed.');

      // Auto-login after registration
      const loginSuccess = await login(email, password);
      if (!loginSuccess) throw new Error("Registration successful, but auto-login failed.");
      
      console.log("AuthContext: Registration successful!");
      return true;
    } catch (error) {
      console.error("AuthContext: Registration error:", error);
      setAuthError(error.message || "Registration failed.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const handleLogout = () => {
    console.log("AuthContext: Performing logout.");
    Cookies.remove('jwt_token');
    localStorage.removeItem('jwt_token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setAuthError(null);
  };

  const value = { user, isAuthenticated, isLoading, authError, login, register, logout: handleLogout, token };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};