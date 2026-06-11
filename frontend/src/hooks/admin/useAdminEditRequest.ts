import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../utils/apiClient';
import type { RepairRequest, TechnicianDetail, RepairLog, RepairImage, AssignmentResponse, User } from '../../types/types';

export function useAdminEditRequest(id: string | undefined) {
  const navigate = useNavigate();
  
  const [request, setRequest] = useState<RepairRequest | null>(null);
  const [logs, setLogs] = useState<RepairLog[]>([]);
  const [images, setImages] = useState<RepairImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('');
  const [note, setNote] = useState('');

  const fetchRequestDetails = useCallback(async () => {
    if (!id) return;
    const data = await apiClient(`/repair-requests/${id}`);
    const reqData = data as RepairRequest;
    setRequest(reqData);
    setTitle(reqData.title);
    setLocation(reqData.location);
    setDescription(reqData.description || '');
    setStatus(reqData.status);
  }, [id]);

  const fetchLogs = useCallback(async () => {
    if (!id) return;
    try {
      const data = await apiClient(`/logs/request/${id}`);
      setLogs(data as RepairLog[]);
    } catch (err) {
      console.error("Failed to fetch logs", err);
    }
  }, [id]);

  const fetchImages = useCallback(async () => {
    if (!id) return;
    try {
      const data = await apiClient(`/repair-images/repair-request/${id}`);
      setImages(data as RepairImage[]);
    } catch (err) {
      console.error("Failed to fetch images", err);
    }
  }, [id]);

  const fetchAssignments = useCallback(async () => {
    if (!id) return;
    try {
      const data = await apiClient(`/assignments/repair-request/${id}`) as AssignmentResponse;
      if (data.technicians) {
        const techDetails: TechnicianDetail[] = await Promise.all(
          data.technicians.map(async (t: { technician_id: number; is_leader: boolean }) => {
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
      }
    } catch (err) {
      console.error(err);
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    window.scrollTo(0, 0);

    async function loadInitialData() {
      try {
        await Promise.all([
          fetchRequestDetails(),
          fetchAssignments(),
          fetchLogs(),
          fetchImages(),
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
  }, [id, fetchRequestDetails, fetchAssignments, fetchLogs, fetchImages]);

  const executeSubmit = async (onSuccess: () => void, onError: (err: Error) => void) => {
    if (!id) return;

    setSubmitting(true);
    try {
      await apiClient(`/repair-requests/${id}`, {
        method: 'PATCH',
        data: {
          title,
          location,
          description,
          status,
          note: note || `แอดมินแก้ไขใบงาน`
        },
      });
      onSuccess();
      navigate('/admin/requests');
    } catch (err) {
      console.error(err);
      onError(err);
    } finally {
      setSubmitting(false);
    }
  };

  return {
    request,
    logs,
    images,
    loading,
    submitting,
    title, setTitle,
    location, setLocation,
    description, setDescription,
    status, setStatus,
    note, setNote,
    executeSubmit
  };
}