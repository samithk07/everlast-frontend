// components/adminProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminProtectedRoute = ({ children }) => {
  const { isAuthenticated, isadmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated()) {
    // Redirect to login with return URL
    return <Navigate to="/login" state={{ from: window.location.pathname }} />;
  }

  if (!isadmin()) {
    // Redirect regular users to home page
    alert('Access denied. admin privileges required.');
    return <Navigate to="/home" />;
  }

  return children;
};

export default AdminProtectedRoute;