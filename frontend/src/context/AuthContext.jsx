import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, fetchUserProfile } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('cinevault_token') || null);
  const [loading, setLoading] = useState(true);

  // Verify stored JWT token on app boot
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('cinevault_token');
      if (storedToken) {
        const response = await fetchUserProfile();
        if (response.success && response.user) {
          setUser(response.user);
          setToken(storedToken);
        } else {
          // Token invalid or expired
          localStorage.removeItem('cinevault_token');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Handle Login
  const login = async (credentials) => {
    const response = await loginUser(credentials);
    if (response.success && response.token && response.user) {
      localStorage.setItem('cinevault_token', response.token);
      setToken(response.token);
      setUser(response.user);
    }
    return response;
  };

  // Handle Register
  const register = async (userData) => {
    const response = await registerUser(userData);
    if (response.success && response.token && response.user) {
      localStorage.setItem('cinevault_token', response.token);
      setToken(response.token);
      setUser(response.user);
    }
    return response;
  };

  // Handle Logout
  const logout = () => {
    localStorage.removeItem('cinevault_token');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    isAuthenticated: !!user,
    role: user?.role || null,
    isAdmin: user?.role === 'admin',
    loading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
