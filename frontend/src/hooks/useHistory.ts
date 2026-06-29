import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../utils/apiClient';
import type { RepairRequest, RepairLog, AssignmentDetail, User, AssignmentResponse } from '../types/types';

const INITIAL_LOAD_COUNT = 5;
const LOAD_MORE_COUNT = 5;

export function useHistory() {
  const navigate = useNavigate();

  const [requests, setRequests] = useState<RepairRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRequestId, setExpandedRequestId] = useState<number | null>(null);
  const [requestLogs, setRequestLogs] = useState<{ [key: number]: RepairLog[] }>({});
  const [logsLoading, setLogsLoading] = useState<{ [key: number]: boolean }>({});
  const [requestAssignments, setRequestAssignments] = useState<{ [key: number]: AssignmentDetail[] }>({});
  const [users, setUsers] = useState<Record<number, User>>({});

  // Lazy loading state
  const [visibleCount, setVisibleCount] = useState(INITIAL_LOAD_COUNT);
  const observerTarget = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      const userStr = localStorage.getItem('user');

      if (!userStr) {
        if (!cancelled) navigate('/login');
        return;
      }

      const user = JSON.parse(userStr);

      try {
        const [data, techData] = await Promise.all([
          apiClient(`/repair-requests/requester/${user.id}`),
          apiClient('/users/technicians')
        ]);

        if (!cancelled) {
          const techMap = (techData as User[]).reduce((acc, tech) => {
            acc[tech.id] = tech;
            return acc;
          }, {} as Record<number, User>);
          setUsers(techMap);

          setRequests(data as RepairRequest[]);
          
          (data as RepairRequest[]).forEach(req => {
            apiClient(`/assignments/repair-request/${req.id}`)
              .then((assignData) => {
                const typedData = assignData as AssignmentResponse;
                if (!cancelled && typedData && typedData.technicians) {
                  setRequestAssignments(prev => ({ ...prev, [req.id]: typedData.technicians }));
                }
              })
              .catch(err => console.error("Failed to fetch assignments", err));
          });
        }
      } catch (err: unknown) {
        console.error("Failed to fetch API", err);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + LOAD_MORE_COUNT, requests.length));
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [requests.length]);

  const toggleLogs = async (requestId: number) => {
    if (expandedRequestId === requestId) {
      setExpandedRequestId(null);
      return;
    }

    setExpandedRequestId(requestId);

    if (!requestLogs[requestId]) {
      setLogsLoading(prev => ({ ...prev, [requestId]: true }));
      try {
        const data = await apiClient(`/logs/request/${requestId}`);
        setRequestLogs(prev => ({ ...prev, [requestId]: data }));
      } catch (err) {
        console.error("Failed to fetch logs", err);
        setRequestLogs(prev => ({ ...prev, [requestId]: [] }));
      } finally {
        setLogsLoading(prev => ({ ...prev, [requestId]: false }));
      }
    }
  };

  return {
    requests,
    loading,
    expandedRequestId,
    requestLogs,
    logsLoading,
    requestAssignments,
    users,
    visibleCount,
    observerTarget,
    toggleLogs
  };
}