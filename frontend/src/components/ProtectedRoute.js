import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { getCurrentUser } from '../services/authApi';

const ProtectedRoute = ({ children }) => {
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await getCurrentUser();
        setStatus('ok');
      } catch (error) {
        setStatus('no');
      }
    };
    checkAuth();
  }, []);

  if (status === 'loading') return <div>Chargement...</div>;
  if (status === 'no') return <Navigate to="/login" replace />;
  return children;
};

export default ProtectedRoute;
