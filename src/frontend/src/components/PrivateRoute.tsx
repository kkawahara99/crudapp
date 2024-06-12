import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/use-auth';

function PrivateRoute({ children }: { children: React.ReactNode}) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/signin" />;
};

export default PrivateRoute;