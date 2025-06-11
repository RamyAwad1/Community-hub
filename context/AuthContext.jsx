
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  // Initialize user state from localStorage for mock persistence
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = () => {
      setIsLoading(true);
      const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
      if (storedUser && storedUser.token) {
        setUser(storedUser);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    };
    checkAuthStatus();
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockUser = {
          id: '1',
          name: 'John Doe',
          email,
          role: 'user',
          token: 'mock-token',
          nickname: 'Johnny', // Added for profile
          bio: 'Avid community volunteer.', // Added for profile
        };
        localStorage.setItem('user', JSON.stringify(mockUser));
        setUser(mockUser);
        setIsAuthenticated(true);
        setIsLoading(false);
        resolve(mockUser);
      }, 1000);
    });
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    navigate('/login');
  };

  const getUserRole = () => user?.role;

  // Mock function to update user profile information
  const updateUser = async (newProfileData) => {
    setIsLoading(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        setUser(prevUser => {
          const updatedUser = { ...prevUser, ...newProfileData };
          localStorage.setItem('user', JSON.stringify(updatedUser)); // Persist updated user
          return updatedUser;
        });
        setIsLoading(false);
        resolve();
      }, 500); // Simulate API call delay
    });
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout, getUserRole, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);