import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../utils/apiClient';
import type { User } from '../types/types';

export function useCompleteProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadUserData() {
      try {
        const tokenStr = localStorage.getItem('access_token');
        const userStr = localStorage.getItem('user');

        if (!tokenStr || !userStr) {
          if (!cancelled) navigate('/login');
          return;
        }

        const userData = JSON.parse(userStr);
        
        if (userData.emp_id) {
          if (!cancelled) navigate('/dashboard');
          return;
        }

        if (!cancelled) {
          setUser(userData);
        }
      } catch (err) {
        console.error("Error loading user data from local storage", err);
        if (!cancelled) navigate('/login');
      }
    }

    loadUserData();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const completeProfile = async (empId: string) => {
    if (!empId.trim()) {
      setError('กรุณากรอกรหัสพนักงาน (Please enter Employee ID)');
      return;
    }

    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const updatedUser = await apiClient(`/users/${user.id}`, {
        method: 'PATCH',
        data: { emp_id: empId },
      });

      // Update local storage with the new user data
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Navigate to dashboard
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An error occurred while updating your profile.');
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    setError,
    completeProfile,
  };
}