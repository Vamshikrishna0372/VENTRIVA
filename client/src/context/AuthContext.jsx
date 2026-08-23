import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Initialize Auth State on Mount
  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    setIsLoading(true);
    const token = localStorage.getItem('ventriva_token');
    if (!token) {
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.get('/auth/me');
      if (res.data?.success && res.data?.user) {
        setUser(res.data.user);
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem('ventriva_token');
        localStorage.removeItem('token');
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (err) {
      localStorage.removeItem('ventriva_token');
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };


  const login = async (email, password) => {
    setAuthError(null);
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data?.success) {
        const { user: userData, token } = res.data;
        if (token) {
          localStorage.setItem('ventriva_token', token);
        }
        setUser(userData);
        setIsAuthenticated(true);
        return { success: true, user: userData };
      } else {
        throw new Error(res.data?.message || 'Login failed');
      }
    } catch (err) {
      const message = err.message || 'Invalid email or password';
      setAuthError(message);
      return { success: false, message };
    }
  };

  const register = async (name, email, password, role) => {
    setAuthError(null);
    try {
      const res = await api.post('/auth/register', { name, email, password, role });
      if (res.data?.success) {
        const { user: userData, token } = res.data;
        if (token) {
          localStorage.setItem('ventriva_token', token);
        }
        setUser(userData);
        setIsAuthenticated(true);
        return { success: true, user: userData };
      } else {
        throw new Error(res.data?.message || 'Registration failed');
      }
    } catch (err) {
      const message = err.message || 'Registration failed';
      setAuthError(message);
      return { success: false, message };
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      // Ignore network failure on logout
    } finally {
      localStorage.removeItem('ventriva_token');
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'guest',
        isAuthenticated,
        isLoading,
        authError,
        login,
        register,
        logout,
        fetchCurrentUser,
      }}
    >
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
