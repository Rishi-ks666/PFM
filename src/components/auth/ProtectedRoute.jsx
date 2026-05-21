import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  
  // Mock authentication check - replace with real auth provider logic later
  // For now, we'll check a simple flag in localStorage so the user can test the flow
  const isAuthenticated = localStorage.getItem('fintech_auth') === 'true';

  if (!isAuthenticated) {
    // Redirect to login while saving the attempted URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
