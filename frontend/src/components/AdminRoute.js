import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getCurrentUser } from '../services/authApi';

const AdminRoute = ({ children }) => {
  const [status, setStatus] = useState('loading');
  const [role, setRole] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await getCurrentUser();
        setRole(data.role);
        setStatus('ok');
        if (data?.username) localStorage.setItem('username', data.username);
        if (data?.role) localStorage.setItem('role', data.role);
      } catch (error) {
        setStatus('no');
        localStorage.removeItem('username');
        localStorage.removeItem('role');
      }
    };
    checkAuth();
  }, []);

  if (status === 'loading') return <div>Chargement...</div>;
  if (status === 'no' || role !== 'admin') return <Navigate to="/" replace />;
  return children;
};

export default AdminRoute;
