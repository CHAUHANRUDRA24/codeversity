import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
      return (
          <div className="flex items-center justify-center min-h-screen bg-gray-50">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
      );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    // Redirect to correct dashboard if role mismatch
    return <Navigate to={user.role === 'recruiter' ? '/recruiter-dashboard' : '/candidate-dashboard'} replace />;
  }

  return children;
};

export default ProtectedRoute;
