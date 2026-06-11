import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../utils/apiClient";
import type { RepairRequest, RepairLog, RepairImage, AssignmentDetail, AssignmentResponse } from "../../types/types";

type Technician = {
  id: number;
  name: string;
  phone?: string | null;
  profile_image_url?: string | null;
};

export function useOnHoldManagement(id: string | undefined) {
  const navigate = useNavigate();

  const [request, setRequest] = useState<RepairRequest | null>(null);
  const [logs, setLogs] = useState<RepairLog[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [assignedTechs, setAssignedTechs] = useState<AssignmentDetail[]>([]);
  const [images, setImages] = useState<RepairImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [selectedTechs, setSelectedTechs] = useState<number[]>([]);
  const [leaderId, setLeaderId] = useState<number | null>(null);
  const [note, setNote] = useState("");

  const fetchRequestDetails = useCallback(async () => {
    if (!id) return;
    const data = await apiClient(`/repair-requests/${id}`);
    const reqData = data as RepairRequest;
    setRequest(reqData);
    if (reqData.appointment_date) {
      const dateObj = new Date(reqData.appointment_date);
      setAppointmentDate(dateObj.toISOString().split("T")[0]);
      setAppointmentTime(dateObj.toTimeString().slice(0, 5));
    }
  }, [id]);

  const fetchLogs = useCallback(async () => {
    if (!id) return;
    const data = await apiClient(`/logs/request/${id}`);
    setLogs(data as RepairLog[]);
  }, [id]);

  const fetchTechnicians = useCallback(async () => {
    try {
      const data = await apiClient(`/users/technicians`);
      setTechnicians(data as Technician[]);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchImages = useCallback(async () => {
    if (!id) return;
    try {
      const data = await apiClient(`/repair-images/repair-request/${id}`);
      setImages(data as RepairImage[]);
    } catch (err) {
      console.error("Failed to fetch images", err);
    }
  }, [id]);

  const fetchAssignedTechs = useCallback(async () => {
    if (!id) return;
    try {
      const data = await apiClient(`/assignments/repair-request/${id}`) as AssignmentResponse;
      setAssignedTechs(data.technicians || []);
    } catch (err) {
      console.error("Failed to fetch assigned technicians", err);
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    async function loadInitialData() {
      try {
        await Promise.all([
          fetchRequestDetails(), 
          fetchLogs(),
          fetchTechnicians(),
          fetchImages(),
          fetchAssignedTechs()
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
  }, [id, fetchRequestDetails, fetchLogs, fetchTechnicians, fetchImages, fetchAssignedTechs]);

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

  const isInvalidTime = () => {
    if (!request?.appointment_date || !appointmentDate || !appointmentTime) return false;
    const oldDateObj = new Date(request.appointment_date);
    const oldDateStr = oldDateObj.toISOString().split("T")[0];
    const oldTimeStr = oldDateObj.toTimeString().slice(0, 5);
    return appointmentDate === oldDateStr && appointmentTime <= oldTimeStr;
  };

  const executeReschedule = async (onSuccess: () => void, onError: (err: Error) => void) => {
    if (!id || !appointmentDate || !appointmentTime) return;

    const finalLeaderId = leaderId || (selectedTechs.length > 0 ? selectedTechs[0] : null);

    setSubmitting(true);
    try {
      const isoDateTime = new Date(
        `${appointmentDate}T${appointmentTime}:00+07:00`,
      ).toISOString();

      await apiClient(`/repair-requests/${id}`, {
        method: "PATCH",
        data: {
          appointment_date: isoDateTime,
          status: "ASSIGNED",
          note: `แอดมินกำหนดวันนัดหมายใหม่`,
        },
      });

      if (selectedTechs.length > 0) {
        await apiClient(`/assignments`, {
          method: "POST",
          data: {
            repair_request_id: parseInt(id, 10),
            appointment_date: isoDateTime,
            technicians: selectedTechs.map(techId => ({
              technician_id: techId,
              is_leader: techId === finalLeaderId
            })),
          },
        });
      }

      onSuccess();
      navigate("/admin/requests");
    } catch (err) {
      console.error(err);
      onError(err);
    } finally {
      setSubmitting(false);
    }
  };

  const executeTerminate = async (onSuccess: () => void, onError: (err: Error) => void) => {
    if (!id) return;
    setSubmitting(true);
    try {
      await apiClient(`/repair-requests/${id}`, {
        method: "PATCH",
        data: {
          status: "CANCELLED",
          note: note,
        },
      });
      onSuccess();
      navigate("/admin/requests");
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
    technicians,
    assignedTechs,
    images,
    loading,
    submitting,
    appointmentDate, setAppointmentDate,
    appointmentTime, setAppointmentTime,
    selectedTechs,
    leaderId, setLeaderId,
    note, setNote,
    handleTechToggle,
    isInvalidTime,
    executeReschedule,
    executeTerminate
  };
}