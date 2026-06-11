import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../../utils/apiClient';
import type { RepairRequest, RepairImage, RepairLog, Review } from '../../types/types';

export function useAdminCompletedRequest(id: string | undefined) {
  const [request, setRequest] = useState<RepairRequest | null>(null);
  const [images, setImages] = useState<RepairImage[]>([]);
  const [logs, setLogs] = useState<RepairLog[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const fetchRequestData = useCallback(() => {
    if (!id) return;
    setLoading(true);
    
    Promise.all([
      apiClient(`/repair-requests/${id}`).catch(() => { throw new Error("Failed to fetch request details") }),
      apiClient(`/repair-images/repair-request/${id}`).catch(() => []),
      apiClient(`/logs/request/${id}`).catch(() => []),
      apiClient(`/reviews/request/${id}`).catch(() => [])
    ])
    .then(([reqData, imgsData, logsData, reviewsData]) => {
      setRequest(reqData as RepairRequest);
      setImages(imgsData as RepairImage[]);
      setLogs(logsData as RepairLog[]);
      setReviews(reviewsData as Review[]);
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

  return { request, images, logs, reviews, loading, error };
}
