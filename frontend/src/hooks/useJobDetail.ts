import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../utils/apiClient";
import type {
  RepairRequest,
  RepairLog,
  AssignmentResponse,
  AssignmentDetail,
  RepairImage,
  User,
} from "../types/types";

export function useJobDetail(id: string | undefined) {
  const navigate = useNavigate();

  const [request, setRequest] = useState<RepairRequest | null>(null);
  const [logs, setLogs] = useState<RepairLog[]>([]);
  const [assignments, setAssignments] = useState<AssignmentDetail[]>([]);
  const [images, setImages] = useState<RepairImage[]>([]);
  const [requester, setRequester] = useState<User | null>(null);

  const [requestLoading, setRequestLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(true);
  const [assignmentsLoading, setAssignmentsLoading] = useState(true);
  const [imagesLoading, setImagesLoading] = useState(true);
  const [requesterLoading, setRequesterLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRequestDetails = useCallback(async () => {
    if (!id) return;
    const data = await apiClient(`/repair-requests/${id}`);
    const req = data as RepairRequest;
    setRequest(req);

    if (req.requester_id) {
      try {
        const userData = await apiClient(`/users/${req.requester_id}`);
        setRequester(userData as User);
      } catch {
        setRequester(null);
      }
    }
  }, [id]);

  const fetchLogs = useCallback(async () => {
    if (!id) return;
    const data = await apiClient(`/logs/request/${id}`);
    setLogs(data as RepairLog[]);
  }, [id]);

  const fetchAssignments = useCallback(async () => {
    if (!id) return;
    const data = await apiClient(`/assignments/repair-request/${id}`);
    setAssignments((data as AssignmentResponse).technicians);
  }, [id]);

  const fetchImages = useCallback(async () => {
    if (!id) return;
    const data = await apiClient(`/repair-images/repair-request/${id}`);
    setImages(data as RepairImage[]);
  }, [id]);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    window.scrollTo(0, 0);

    async function loadInitialData() {
      try {
        await Promise.all([
          fetchRequestDetails(),
          fetchLogs(),
          fetchAssignments(),
          fetchImages(),
        ]);
      } catch (err) {
        if (!cancelled) {
          console.error("Error loading page data", err);
        }
      } finally {
        if (!cancelled) {
          setRequestLoading(false);
          setLogsLoading(false);
          setAssignmentsLoading(false);
          setImagesLoading(false);
          setRequesterLoading(false);
        }
      }
    }

    loadInitialData();

    return () => {
      cancelled = true;
    };
  }, [id, fetchRequestDetails, fetchLogs, fetchAssignments, fetchImages]);

  const handleOnHoldConfirm = async (reason: string, notes: string, photo: File | null) => {
    if (!id) return;

    const userStr = localStorage.getItem('user');
    
    if (!userStr) {
      navigate('/login');
      return;
    }
    
    const user = JSON.parse(userStr);
    const fullNote = `พักงาน: ${reason}${notes ? ` - ${notes}` : ""}`;

    try {
      setRefreshing(true);
      await apiClient(`/repair-requests/${id}`, {
        method: "PATCH",
        data: {
          status: "ON_HOLD",
          note: fullNote,
        },
      });

      if (photo) {
        const formData = new FormData();
        formData.append("repair_request_id", id.toString());
        formData.append("image_type", "ON_HOLD");
        formData.append("uploaded_by", user.id.toString());
        formData.append("file", photo);

        try {
          await apiClient(`/repair-images`, {
            method: "POST",
            data: formData,
          });
        } catch (photoErr) {
          console.warn("Failed to upload ON_HOLD photo", photoErr);
        }
      }

      await Promise.all([fetchRequestDetails(), fetchLogs(), fetchImages()]);
    } catch (error) {
      console.error("Error confirming on hold:", error);
      throw error;
    } finally {
      setRefreshing(false);
    }
  };

  const handleAcceptWork = async () => {
    if (!id || !request) return;

    if (request.status === "ASSIGNED" || request.status === "ON_HOLD") {
      try {
        setRefreshing(true);
        await apiClient(`/repair-requests/${id}`, {
          method: "PATCH",
          data: {
            status: "IN_PROGRESS",
            note: "รับงาน: ช่างเทคนิคกำลังเดินทางไปตรวจสอบ",
          },
        });

        // Navigate to completion page after successfully accepting
        navigate(`/request/${id}/complete`);
      } catch (error) {
        console.error("Error accepting work:", error);
        alert("เกิดข้อผิดพลาดในการรับงาน กรุณาลองอีกครั้ง");
        setRefreshing(false);
      }
    } else {
      // If already in progress, just go to completion page
      navigate(`/request/${id}/complete`);
    }
  };

  return {
    request,
    logs,
    assignments,
    images,
    requestLoading,
    logsLoading,
    assignmentsLoading,
    imagesLoading,
    requester,
    requesterLoading,
    refreshing,
    handleOnHoldConfirm,
    handleAcceptWork
  };
}