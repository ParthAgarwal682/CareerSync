import React, { createContext, useState, useEffect } from 'react';
import { login as apiLogin, signup as apiSignup, getMe } from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await getMe();
          setUser(res.user);
        } catch (error) {
          console.error("Failed to fetch user, token might be invalid", error);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await apiLogin(email, password);
      localStorage.setItem('token', res.token);
      setUser(res.user);
      return { success: true, user: res.user };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error?.message || 'Login failed' 
      };
    }
  };

  const signup = async (userData) => {
    try {
      const res = await apiSignup(userData);
      localStorage.setItem('token', res.token);
      setUser(res.user);
      return { success: true, user: res.user };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error?.message || 'Signup failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
