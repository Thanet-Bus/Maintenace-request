import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../utils/apiClient';
import type { RepairRequest, RepairImage, User } from '../../types/types';

type Technician = {
  id: number;
  name: string;
  phone?: string | null;
  profile_image_url?: string | null;
};

export function useTeamAssignment(id: string | undefined) {
  const navigate = useNavigate();
  const [request, setRequest] = useState<RepairRequest | null>(null);
  const [requester, setRequester] = useState<User | null>(null)
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [images, setImages] = useState<RepairImage[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [selectedTechs, setSelectedTechs] = useState<number[]>([]);
  const [leaderId, setLeaderId] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [conflictingTechs, setConflictingTechs] = useState<number[]>([]);

  const fetchRequestDetails = useCallback(() => {
    if (!id) return;
    
    return new Promise<void>((resolve, reject) => {
      setLoading(true);
      apiClient(`/repair-requests/${id}`)
        .then(data => {
          const reqData = data as RepairRequest;
          setRequest(reqData);
          return apiClient(`/users/${reqData.requester_id}`);
        }).then(userData => {
          setRequester(userData as User)
          resolve();
        })
        .catch(err => {
          console.error(err);
          reject(err);
        })
        .finally(() => {
          setLoading(false);
        });
    });
  }, [id]);

  const fetchTechnicians = useCallback(() => {
    apiClient(`/users/technicians`)
      .then(data => setTechnicians(data as Technician[]))
      .catch(err => console.error(err));
  }, []);

  const fetchImages = useCallback(() => {
    if (!id) return;
    apiClient(`/repair-images/repair-request/${id}`)
      .then(data => setImages(data as RepairImage[]))
      .catch(err => console.error(err));
  }, [id]);

  useEffect(() => {
    fetchRequestDetails()?.catch(() => {});
    fetchTechnicians();
    fetchImages();

    return () => {};
  }, [fetchRequestDetails, fetchTechnicians, fetchImages]);

  useEffect(() => {
    const checkConflicts = async () => {
      if (selectedTechs.length === 0 || !appointmentDate || !appointmentTime) {
        setConflictingTechs([]);
        return;
      }

      const isoDateTime = new Date(`${appointmentDate}T${appointmentTime}:00+07:00`).toISOString();
      const proposedTime = new Date(isoDateTime).getTime();

      try {
        const conflictResults = await Promise.all(
          selectedTechs.map(async (techId) => {
            try {
              const assignments = await apiClient(`/assignments/technician/${techId}`) as RepairRequest[];
              const hasConflict = assignments.some(assignment => {
                if (!assignment.appointment_date) return false;
                const assignedTime = new Date(assignment.appointment_date).getTime();
                return assignedTime === proposedTime;
              });
              
              return hasConflict ? techId : null;
            } catch (err) {
              // We catch and log here instead of ignoring, so one failing request 
              // doesn't prevent checking the other selected technicians.
              console.warn(`Could not fetch assignments for technician ${techId} to check conflicts:`, err);
              return null;
            }
          })
        );

        const newConflicts = conflictResults.filter((id): id is number => id !== null);
        setConflictingTechs(newConflicts);
      } catch (err) {
         console.error("Error checking conflicts:", err);
      }
    };

    checkConflicts();
  }, [selectedTechs, appointmentDate, appointmentTime]);

  const handleTechToggle = (techId: number) => {
    setSelectedTechs(prev => {
      const isSelected = prev.includes(techId);
      if (isSelected) {
        if (leaderId === techId) setLeaderId(null);
        return prev.filter(id => id !== techId);
      } else {
        if (prev.length === 0) setLeaderId(techId);
        return [...prev, techId];
      }
    });
  };

  const executeSubmit = async (onSuccess: () => void, onError: (err: Error) => void) => {
    if (!id || selectedTechs.length === 0 || !appointmentDate || !appointmentTime) {
      onError(new Error("Missing data"));
      return;
    }

    const finalLeaderId = leaderId || selectedTechs[0];

    const isoDateTime = new Date(`${appointmentDate}T${appointmentTime}:00+07:00`).toISOString();

    const payload = {
        repair_request_id: parseInt(id, 10),
        appointment_date: isoDateTime,
        technicians: selectedTechs.map(techId => ({
          technician_id: techId,
          is_leader: techId === finalLeaderId
        })),
        note: note || "แอดมินกำหนดงานให้ช่าง",
    };

    setSubmitting(true);
    try {
      await apiClient(`/assignments`, {
        method: 'POST',
        data: payload
      });

      setNote('');
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
    requester,
    technicians,
    images,
    loading,
    submitting,
    appointmentDate, setAppointmentDate,
    appointmentTime, setAppointmentTime,
    selectedTechs,
    leaderId, setLeaderId,
    note, setNote,
    conflictingTechs,
    handleTechToggle,
    executeSubmit
  };
}