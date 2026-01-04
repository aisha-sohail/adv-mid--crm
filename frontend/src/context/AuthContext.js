import React, { createContext, useState, useEffect, useMemo, useCallback } from 'react';
import API from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token) {
      setLoading(false);
      return undefined;
    }

    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        localStorage.removeItem('user');
      }
    }

    API.get('/users/me')
      .then((response) => {
        if (!isMounted) return;
        setUser(response.data);
        localStorage.setItem('user', JSON.stringify(response.data));
      })
      .catch(() => {
        if (!isMounted) return;
        logout();
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [logout]);

  const login = useCallback(async (email, password) => {
    const response = await API.post('/auth/login', { email, password });
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    setUser(response.data.user);
    return response.data;
  }, []);

  const register = useCallback(async (userData) => {
    const response = await API.post('/auth/register', userData);
    return response.data;
  }, []);

  useEffect(() => {
    const interceptorId = API.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error?.response?.status === 401) {
          logout();
          if (window.location.pathname !== '/login') {
            window.location.assign('/login');
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      API.interceptors.response.eject(interceptorId);
    };
  }, [logout]);

  const value = useMemo(() => ({
    user,
    login,
    register,
    logout,
    loading
  }), [user, login, register, logout, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
