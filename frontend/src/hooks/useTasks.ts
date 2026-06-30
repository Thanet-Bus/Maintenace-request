import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../utils/apiClient';
import type { RepairRequest } from '../types/types';

export function useTasks() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<RepairRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadTasks() {
      const userStr = localStorage.getItem('user');

      if (!userStr) {
        if (!cancelled) navigate('/login');
        return;
      }

      try {
        const data = await apiClient('/repair-requests/my-tasks');

        if (!cancelled) {
          setRequests(data as RepairRequest[]);
        }
      } catch (err: unknown) {
        console.error("Failed to fetch API", err);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadTasks();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return { requests, loading };
}
