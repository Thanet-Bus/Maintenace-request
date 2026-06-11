import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../utils/apiClient";
import SignatureCanvas from 'react-signature-canvas';
import type {
  RepairRequest,
  AssignmentDetail,
  AssignmentResponse,
} from "../types/types";

interface TechnicianRating {
  technician_id: number;
  rating: number;
  comment: string;
}

export function useJobCompletion(id: string | undefined) {
  const navigate = useNavigate();

  const [request, setRequest] = useState<RepairRequest | null>(null);
  const [assignments, setAssignments] = useState<AssignmentDetail[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [summary, setSummary] = useState("");
  const [ratings, setRatings] = useState<Record<number, TechnicianRating>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canvasRef = useRef<SignatureCanvas>(null);
  const [hasSignature, setHasSignature] = useState(false);
  const [isSignatureConfirmed, setIsSignatureConfirmed] = useState(false);

  const fetchRequestDetails = useCallback(async () => {
    if (!id) return;
    const data = await apiClient(`/repair-requests/${id}`);
    setRequest(data as RepairRequest);
  }, [id]);

  const fetchAssignments = useCallback(async () => {
    if (!id) return;
    const data = await apiClient(`/assignments/repair-request/${id}`);
    const assignmentData = data as AssignmentResponse;
    setAssignments(assignmentData.technicians);

    // Initialize ratings state
    const initialRatings: Record<number, TechnicianRating> = {};
    assignmentData.technicians.forEach((tech) => {
      initialRatings[tech.technician_id] = {
        technician_id: tech.technician_id,
        rating: 0,
        comment: "",
      };
    });
    setRatings(initialRatings);
  }, [id]);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    window.scrollTo(0, 0);

    async function loadData() {
      try {
        await Promise.all([fetchRequestDetails(), fetchAssignments()]);
      } catch (err) {
        if (!cancelled) console.error("Error loading data", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [id, fetchRequestDetails, fetchAssignments]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setPhoto(selectedFile);
      setPhotoPreview(URL.createObjectURL(selectedFile));
    }
  };

  const removePhoto = () => {
    setPhoto(null);
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(null);
  };

  const clearSignature = () => {
    canvasRef.current?.clear();
    setHasSignature(false);
    setIsSignatureConfirmed(false);
  };

  const confirmSignature = () => {
    if (canvasRef.current && !canvasRef.current.isEmpty()) {
      setIsSignatureConfirmed(true);
    }
  };

  const handleRatingChange = (techId: number, rating: number) => {
    setRatings((prev) => ({
      ...prev,
      [techId]: { ...prev[techId], rating },
    }));
  };

  const handleCommentChange = (techId: number, comment: string) => {
    setRatings((prev) => ({
      ...prev,
      [techId]: { ...prev[techId], comment },
    }));
  };

  const isFormValid = summary.trim() !== "" && isSignatureConfirmed;

  const handleSubmit = async () => {
    if (!isFormValid || !id) return;

    setIsSubmitting(true);
    
    const userStr = localStorage.getItem('user');
    
    if (!userStr) {
      navigate('/login');
      return;
    }
    
    const user = JSON.parse(userStr);

    try {
      // 1. Update Request Status to COMPLETED
      await apiClient(`/repair-requests/${id}`, {
        method: "PATCH",
        data: {
          status: "COMPLETED",
          note: `ปิดงาน: ${summary}`,
        },
      });

      // 2. Upload COMPLETE photo if available
      if (photo) {
        const formData = new FormData();
        formData.append("repair_request_id", id.toString());
        formData.append("image_type", "COMPLETE");
        formData.append("uploaded_by", user.id.toString());
        formData.append("file", photo);

        try {
          await apiClient(`/repair-images`, {
            method: "POST",
            data: formData,
          });
        } catch (photoErr) {
          console.warn("Failed to upload complete photo", photoErr);
        }
      }

      // 3. Upload SIGNATURE image
      if (canvasRef.current && hasSignature) {
        const canvas = canvasRef.current.getCanvas();
        const signatureBlob = await new Promise<Blob | null>((resolve) => {
          canvas.toBlob((blob) => resolve(blob), "image/png");
        });

        if (signatureBlob) {
          const signatureFile = new File([signatureBlob], "signature.png", { type: "image/png" });
          const sigFormData = new FormData();
          sigFormData.append("repair_request_id", id.toString());
          sigFormData.append("image_type", "SIGNATURE");
          sigFormData.append("uploaded_by", user.id.toString());
          sigFormData.append("file", signatureFile);

          try {
            await apiClient(`/repair-images`, {
              method: "POST",
              data: sigFormData,
            });
          } catch (sigErr) {
            console.warn("Failed to upload signature", sigErr);
          }
        }
      }

      // 4. Submit ratings to the review API
      const reviewPromises = Object.values(ratings)
        .filter((r) => r.rating > 0)
        .map((r) =>
          apiClient(`/reviews`, {
            method: "POST",
            data: {
              repair_request_id: parseInt(id),
              technician_id: r.technician_id,
              rating: r.rating,
              comment: r.comment || null,
            },
          }).catch(err => {
            console.warn(`Failed to submit review for tech ID ${r.technician_id}`, err);
          })
        );

      if (reviewPromises.length > 0) {
        await Promise.all(reviewPromises);
      }

      navigate("/tasks", { replace: true });
    } catch (error) {
      console.error("Error completing job:", error);
      alert("เกิดข้อผิดพลาดในการปิดงาน กรุณาลองอีกครั้ง");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    request,
    assignments,
    loading,
    summary,
    setSummary,
    ratings,
    isSubmitting,
    photoPreview,
    fileInputRef,
    canvasRef,
    hasSignature,
    setHasSignature,
    isSignatureConfirmed,
    handlePhotoChange,
    removePhoto,
    clearSignature,
    confirmSignature,
    handleRatingChange,
    handleCommentChange,
    isFormValid,
    handleSubmit
  };
}