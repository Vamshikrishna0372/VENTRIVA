import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [pendingGoogleUser, setPendingGoogleUser] = useState(null);

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

  const getErrorMessage = (err, fallback) => {
    if (!err) return fallback;
    if (typeof err === 'string') return err;
    if (err.message && typeof err.message === 'string') return err.message;
    if (err.data?.message && typeof err.data.message === 'string') return err.data.message;
    if (err.response?.data?.message && typeof err.response.data.message === 'string') return err.response.data.message;
    return fallback;
  };

  const login = async (email, password) => {
    setAuthError(null);
    try {
      const res = await api.post('/auth/login', { email: email.trim().toLowerCase(), password });
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
      const message = getErrorMessage(err, 'Invalid email or password');
      setAuthError(message);
      return { success: false, message };
    }
  };

  const loginWithGoogle = async (credential, role = null) => {
    setAuthError(null);
    try {
      const res = await api.post('/auth/google', { credential, role });
      if (res.data?.success) {
        if (res.data.requiresOnboarding && res.data.googleIdentity) {
          setPendingGoogleUser(res.data.googleIdentity);
          return { success: true, requiresOnboarding: true, googleIdentity: res.data.googleIdentity };
        }

        const { user: userData, token } = res.data;
        if (token) {
          localStorage.setItem('ventriva_token', token);
        }
        setPendingGoogleUser(null);
        setUser(userData);
        setIsAuthenticated(true);
        return { success: true, user: userData, isNewUser: res.data.isNewUser || false };
      } else {
        throw new Error(res.data?.message || 'Google authentication failed');
      }
    } catch (err) {
      const message = getErrorMessage(err, 'Google authentication failed');
      setAuthError(message);
      return { success: false, message };
    }
  };

  const register = async (name, email, password, role) => {
    setAuthError(null);
    try {
      const res = await api.post('/auth/register', { name, email: email.trim().toLowerCase(), password, role });
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
      const message = getErrorMessage(err, 'Registration failed');
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
      setPendingGoogleUser(null);
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
        pendingGoogleUser,
        setPendingGoogleUser,
        login,
        loginWithEmail: login,
        loginWithGoogle,
        register,
        logout,
        fetchCurrentUser,
        restoreSession: fetchCurrentUser,
        setUser,
        updateUser: (updatedUser) => setUser(updatedUser),
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
