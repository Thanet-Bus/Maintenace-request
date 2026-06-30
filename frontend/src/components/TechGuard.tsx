import React from 'react';
import { Navigate } from 'react-router-dom';
import type { User } from '../types/types';

interface TechGuardProps {
  children: React.ReactNode;
}

const getCurrentUser = (): User | null => {
  try {
    const rawUser = localStorage.getItem('user');
    return rawUser ? (JSON.parse(rawUser) as User) : null;
  } catch {
    return null;
  }
};

const TechGuard: React.FC<TechGuardProps> = ({ children }) => {
  const currentUser = getCurrentUser();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (currentUser.role !== 'TECH') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default TechGuard;
