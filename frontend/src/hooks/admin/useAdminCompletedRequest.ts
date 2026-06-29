import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../../utils/apiClient';
import type { RepairRequest, RepairImage, RepairLog, Review, TechnicianDetail, AssignmentResponse, User } from '../../types/types';

export function useAdminCompletedRequest(id: string | undefined) {
  const [request, setRequest] = useState<RepairRequest | null>(null);
  const [requester, setRequester] = useState<User | null>(null);
  const [images, setImages] = useState<RepairImage[]>([]);
  const [logs, setLogs] = useState<RepairLog[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const fetchRequestData = useCallback(() => {
    if (!id) return;
    setLoading(true);
    setError('');
    
    Promise.all([
      apiClient(`/repair-requests/${id}`).catch(() => { throw new Error("Failed to fetch request details") }),
      apiClient(`/repair-images/repair-request/${id}`).catch(() => []),
      apiClient(`/logs/request/${id}`).catch(() => []),
      apiClient(`/reviews/request/${id}`).catch(() => [])
    ])
    .then(async ([reqData, imgsData, logsData, reviewsData]) => {
      const req = reqData as RepairRequest;
      setRequest(req);
      setImages(imgsData as RepairImage[]);
      setLogs(logsData as RepairLog[]);
      setReviews(reviewsData as Review[]);

      const [userData, assignmentsData] = await Promise.all([
        apiClient(`/users/${req.requester_id}`).catch(() => null),
        apiClient(`/assignments/repair-request/${req.id}`).catch(() => null)
      ]);

      if (userData) {
        setRequester(userData as User);
      }

      const assignmentTechnicians = (assignmentsData as AssignmentResponse | null)?.technicians;
      if (assignmentTechnicians?.length) {
        const techDetails: TechnicianDetail[] = await Promise.all(
          assignmentTechnicians.map(async (t: { technician_id: number; is_leader: boolean }) => {
            try {
              const userData = await apiClient(`/users/${t.technician_id}`) as User;
              return {
                id: t.technician_id,
                name: userData.name || `Technician ${t.technician_id}`,
                is_leader: t.is_leader,
              };
            } catch {
              return {
                id: t.technician_id,
                name: `Technician ${t.technician_id}`,
                is_leader: t.is_leader,
              };
            }
          })
        );
        setRequest(prev => prev ? { ...prev, technicians: techDetails } : prev);
      } else if (req.technicians?.length) {
        setRequest(prev => prev ? { ...prev, technicians: req.technicians } : prev);
      }
    })
    .catch(err => {
      console.error(err);
      setError("เกิดข้อผิดพลาดในการโหลดข้อมูล");
    })
    .finally(() => {
      setLoading(false);
    });
  }, [id]);

  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
        if (!isMounted) return;
        await fetchRequestData();
    };
    
    loadData();

    return () => {
        isMounted = false;
    };
  }, [fetchRequestData]);

  return { request, requester, images, logs, reviews, loading, error };
}
