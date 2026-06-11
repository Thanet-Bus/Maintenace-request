import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../../utils/apiClient';
import type { RepairRequest, AssignmentResponse, Review } from '../../types/types';

type Technician = {
  id: number;
  username: string;
  name: string;
  phone?: string | null;
  profile_image_url?: string | null;
  activeJobsCount?: number;
  avgRating?: number;
};

export function useTechnicians() {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);

  // History Modal State
  const [selectedTech, setSelectedTech] = useState<Technician | null>(null);
  const [techRequests, setTechRequests] = useState<RepairRequest[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTechnicians = useCallback(async () => {
    try {
      const data = await apiClient(`/users/technicians`);
      const techsWithStats = await Promise.all((data as Technician[]).map(async (tech: Technician) => {
        let activeJobsCount = 0;
        let avgRating = 0;
        
        try {
          const [assignments, reviews] = await Promise.all([
            apiClient(`/assignments/technician/${tech.id}`).catch(() => []),
            apiClient(`/reviews/technician/${tech.id}`).catch(() => [])
          ]) as [RepairRequest[], Review[]];
          
          activeJobsCount = assignments.length;
          
          if (reviews.length > 0) {
            avgRating = reviews.reduce((sum: number, r: {rating: number}) => sum + r.rating, 0) / reviews.length;
          }
        } catch (err) {
           console.error(`Failed to fetch stats for tech ${tech.id} ${err}`);
        }
        
        return { ...tech, activeJobsCount, avgRating };
      }));
      
      setTechnicians(techsWithStats);
    } catch (err) {
      console.error("Failed to fetch technicians", err);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadInitialData() {
      try {
        await Promise.all([
          fetchTechnicians(),
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
  }, [fetchTechnicians]);

  const handleViewHistory = useCallback(async (tech: Technician) => {
    setSelectedTech(tech);
    setIsModalOpen(true);
    setHistoryLoading(true);
    setTechRequests([]);

    try {
      // 1. Get assignments for this technician
      const assignments = await apiClient(`/assignments/technician/${tech.id}`) as AssignmentResponse[];

      // 2. Fetch full details for each unique request
      const requestIds = assignments.map((a: AssignmentResponse) => a.repair_request_id);
      const uniqueIds = Array.from(new Set(requestIds));

      const requestDetails = await Promise.all(
        uniqueIds.map(async (id) => {
          try {
            return await apiClient(`/repair-requests/${id}`);
          } catch (err) {
            console.warn(`Failed to fetch details for request ID ${id}:`, err);
            return null;
          }
        })
      );

      setTechRequests(requestDetails.filter(r => r !== null) as RepairRequest[]);
    } catch (err) {
      console.error("Error loading technician history", err);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  return {
    technicians,
    loading,
    selectedTech,
    techRequests,
    historyLoading,
    isModalOpen, setIsModalOpen,
    handleViewHistory
  };
}