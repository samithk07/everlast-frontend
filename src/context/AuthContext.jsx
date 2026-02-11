// contexts/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const savedUser = localStorage.getItem('user');
        
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          
          // Enhanced validation with role support
          if (userData && typeof userData === 'object' && userData.id) {
            setUser(userData);
          } else {
            localStorage.removeItem('user');
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('AuthProvider - Error loading user:', error);
        localStorage.removeItem('user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (userData) => {
    if (userData && typeof userData === 'object' && userData.id) {
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } else {
      console.error('AuthProvider - Invalid user data provided for login:', userData);
      throw new Error('Invalid user data');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('guest_cart');
  };

  const isAuthenticated = () => {
    return !!(user && user.id);
  };

  const isadmin = () => {
    return !!(user && user.role === 'admin');
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated,
    isadmin
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