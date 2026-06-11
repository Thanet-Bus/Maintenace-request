import { useState, useEffect, useCallback, useRef } from 'react';
import { apiClient } from '../../utils/apiClient';
import type { RepairRequest, User } from '../../types/types';

const INITIAL_LOAD_COUNT = 15;
const LOAD_MORE_COUNT = 10;

export function useAdminRequests() {
  const [requests, setRequests] = useState<RepairRequest[]>([]);
  const [users, setUsers] = useState<Record<number, User>>({});
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('');
  
  // Lazy loading state
  const [visibleCount, setVisibleCount] = useState(INITIAL_LOAD_COUNT);
  const observerTarget = useRef<HTMLTableRowElement | null>(null);

  const fetchRequests = useCallback(async () => {
    const data = await apiClient('/repair-requests');
    setRequests(data as RepairRequest[]);
  }, []);

  const fetchUsers = useCallback(async () => {
    const data = await apiClient('/users');
    const userMap = (data as User[]).reduce((acc, user) => {
      acc[user.id] = user;
      return acc;
    }, {} as Record<number, User>);
    
    setUsers(userMap);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadInitialData() {
      try {
        setLoading(true);
        await Promise.all([
          fetchRequests(),
          fetchUsers()
        ]);
      } catch (err) {
        if (!cancelled) {
          console.error("Error loading page data", err);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadInitialData();

    return () => {
      cancelled = true;
    };
  }, [fetchRequests, fetchUsers]);

  const filteredRequests = requests.filter(req => {
    const matchesStatus = statusFilter === '' || req.status === statusFilter;
    const userName = users[req.requester_id]?.name || `User ${req.requester_id}`;
    
    const matchesSearch = searchQuery === '' || 
      req.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      req.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `#REQ-${req.id.toString().padStart(4, '0')}`.toLowerCase().includes(searchQuery.toLowerCase());
      
    let matchesDate = true;
    if (dateFilter) {
      // YYYY-MM-DD local representation
      const createdDate = new Date(req.created_at);
      const createdDateStr = new Date(createdDate.getTime() - (createdDate.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
      
      let apptDateStr = null;
      if (req.appointment_date) {
        const apptDate = new Date(req.appointment_date);
        apptDateStr = new Date(apptDate.getTime() - (apptDate.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
      }
      
      matchesDate = (createdDateStr === dateFilter) || (apptDateStr === dateFilter);
    }
    
    return matchesStatus && matchesSearch && matchesDate;
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + LOAD_MORE_COUNT, filteredRequests.length));
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [filteredRequests.length]);

  return {
    requests,
    users,
    loading,
    statusFilter, setStatusFilter,
    searchQuery, setSearchQuery,
    dateFilter, setDateFilter,
    visibleCount,
    observerTarget,
    filteredRequests,
    fetchRequests,
    fetchUsers,
    setLoading
  };
}